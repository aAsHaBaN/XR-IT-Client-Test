# Knowledge transfer Arjo

The intent of this document is to describe the reasoning behind certain
software design choices I made for the plugin. Some are non-obvious and look ugly on the surface, but were
forced due to constraints and requirements outside my control. 

## Reason for using libwebsockets and simdjson

One of the design goals with the plugin was to use minimal dependencies and minimal overhead. 
This is the reason libwebsockets and simdjson were chosen.

The reason why I thought this minimal overhead and performance were critical is because I predicted that this configuration file would get sent every time 
a singular change was made (e.g. a simple enum value change), and because it doesn't do any diffing, it sends the whole json configuration file again.
While at the moment this json file is not yet that large, once a good 20-30 plugins and systems inside Unreal are automated with configurable properties, and all
settings are constantly reflected back and forth, in a real-time environment (such as is the case with Unreal Engine and the motion capture / virtual production use case), 
we don't want to hinder the other systems by taking up too much CPU performance. 

In hindsight, because we are running things on a separate thread anyway, it might not impact the performance of Unreal. 

## Why is there a separate core module?

A requirement for the plugin was also to reflect the state of Unreal back to the XR-IT Node via a 
"status update". Unfortunately, Unreal hides away much of its state, and thus requires us to write a
caching layer in between for specific types. This caching layer is implemented for LiveLink sources, as
there is no way to retrieve all their settings. 

Because caching is tricky to get right, it was important to write it in a testable manner. 
Unfortunately, Unit testing inside Unreal is not possible, or not easily doable / idiomatic. In addition, in order to test anything, each time
Unreal had to be restarted, sometimes recompiling shaders even, which resulted in very slow development iteration
times. 

Therefore, I made the decision to separate logic that could be separated (and needed to be tested) such as the caching
logic, into a normal static C++ library that the Unreal plugin could then statically link against. 

Unfortunately, Unreal engine has a non-standard build system, and it for example uses a different C runtime on Windows. 
This added extra work to make the compiled static library work, and this can be seen in the `CMakeLists.txt` of the core module. 

## On the LiveLink caching system

I think the LiveLink cache layer is the ugliest part of this entire codebase, and I would love for it to not be necessary, but we are not allowed to change the
LiveLink source. 

Because caching requires determining whether the types have changed, we calculate a hash via:

```c++
HASH_STRUCT(xrit_unreal::LiveLinkDummySourceSettings)
HASH_FIELD(std::string_view, ip_address)
HASH_FIELD(int64_t, port)
HASH_STRUCT_END
```

This implements a simple prime number based hash over each field. Alternatively, one could provide a custom
`std::hash` template specialization. Be warned that C++ has bad error messages, so if no std::hash is defined, the entire template function is invalid and 
becomes undefined, but it doesn't say it's because of the lacking `std::hash`.

**So: if `setLiveLinkSources` symbol is not defined: check whether all `std::hash` template specializations are there for all source types.** 

## On the reflection system

The core idea of the plugin is to send json back and forth from and to the XR-IT Node. This json needs to be parsed and serialized. 
Initially, I wrote this in an imperative / procedural way, but this resulted in a lot of duplicated logic, and a lot of copy-pasted 
error handling. 

Therefore, I wrote a simple system that uses compile time reflection (see `core/include/xrit_unreal/data/reflect/reflect.h`) to 
parse all fields with the intended behaviour, and correct error handling. And because serialization is not handled inside `simdjson`, this is
handwritten too. An annoyance which was the result of the decision to use `simdjson` over something with a friendly API such as `nlohmann/json`. 

Support is there for `struct`s, composition (no inheritance), `std::variant` for tagged union types (for polymorphism), `std::vector` for lists and `std::unordered_map` for dictionaries.

C++ doesn't natively support reflection, and requires the programmer to somehow get that data into the program themselves.

Because I don't like using compiler specific tricks for getting the reflection data (e.g. used by `reflect-cpp`), as the code needs to be highly portable, 
macros were chosen. 

However, because macros are highly repetitive to write, especially with the changing data configuration format, I wrote a simple Python script that parses the header files inside
`include/xrit_unreal/data` and creates a `_generated.h` accompanying header file with the original data file. 
This approach was chosen over 1) hacking the compiler to emit reflection data, 2) using compiler specific built-ins and hacks to retrieve struct names and fields, 
or 3) using a library that implements either approach 1 or 2. 

Parsing C++ is a *very* complicated task, and thus an ugly approximation (with `REFLECT_STRUCT` and `REFLECT()`) is used. Because the underlying methodology (of using macros) is 
still the least bad option for reflection in a portable manner, the somewhat hacky way to automatically generate those macros, is not as bad. 

Side note: Because we want custom parsing logic and caching behaviour for the types we wish to reflect in the core module (due to aforementioned reasons), 
we can't rely on Unreal's built-in reflection system. 

Side note: As an additional confirmation on the validity of this approach: this is exactly the same as what Unreal does with their UnrealHeaderTool to generate reflection data
headers for the headers that use `UObject` and `UClass` etc. classes. 

## Blueprints

Part of the requirements for the Unreal plugin is to work with Blueprints. While I have done research on how Blueprints work (both from a user perspective and 
internally), the plugin doesn't contain any logic for generating Blueprints, contain Blueprint templates or instantiation of Blueprints based on configuration data.

## Dynamic loading / explicit linking for optional plugin dependencies

This was taken from a Slack message sent on 2024-10-29:

An Unreal Plugin contains one or more Modules. A Module is a dynamic library (`.dll`).

A `DLL` can be:
- implicitly linked 
- explicitly linked

A `DLL` can not be statically linked. That means that symbols (i.e. function definitions) are retrieved on runtime, and thus can’t be compiled into the Module.

### Implicit vs explicit linking

In our `DLL`, we call functions that are inside another `DLL`. These functions need to be present in the other `DLL`’s **export table**.

**Implicit linking** means we directly use the functions as defined in the Module’s header files, e.g. a constructor (`FLiveLinkMvnSource::FliveLinkMvnSource(int port);`), 
or another function.

When we call a function of the other `DLL`, but that `DLL` is not present, the program crashes when the operating system attempts to implicitly link against the that other `DLL`. 
Thus, we can’t use implicit linking in a context where we might not know whether that DLL exists (i.e. whether the plugin is installed by the end user).

The only way to conditionally call code from another DLL, depending on whether that DLL exists, is by using **explicit linking**.

Unreal itself uses explicit linking to initialize modules, as it doesn't know about which plugins are present at runtime. Only one function (`InitializeModule`) 
per Module is called, and that function is marked `extern "C"` to avoid name mangling (and also `__declspec(dllexport)` to explicitly add it to the `DLL`’s export table).

### How explicit linking works

#### 1. Load library

Explicit linking works by calling the following method to load the `DLL` (on Windows). 

```c++
auto handle = LoadLibrary("MyDLLName.dll");
```

We can then easily check whether handle is `nullptr` to handle the case where the `DLL` is not present on the end-user’s computer.

#### 2. Load function pointers

After this, we can retrieve function pointers to the functions that exist in the loaded DLL via:

```c++
auto functionptr = GetProcAddress(handle, "MyFunctionName");
```

*Note that we use a string containing the symbol name to retrieve the function pointer.*

We can then call that function via its function pointer.

### Dealing with name mangling (by using wrapper DLLs)

If we wish to use this technique in our Unreal plugin, there is one challenge: name mangling. While `InitializeModule()` is exposed in the export table as 
`InitializeModule`, C++ compilers add type information to the symbol name to e.g. support function overloading. So `void foo(int b, int c);` can become something like: `_foo@_i@_i`. This name mangling is compiler and target platform specific, and thus not desirable to hardcode into our plugin.

As such, it makes the most sense to take the following approach:

Each optional plugin gets a wrapper `DLL`. So plugin `LiveLinkMvnPlugin` gets Module `XritIntegrationMvn`.

`XritIntegrationMvn` implicitly links with `LiveLinkMvnPlugin`.

It wraps functions we need from the `LiveLinkMvnPlugin` and marks these `extern “C” __declspec(dllexport)` to add the functions to the export table, non-name mangled. 

For example:

```c++
extern "C"
{
    __declspec(dllexport) void SomeMemberFunction(FMvnPose& Pose, int A)
    {
    Pose.SomeMemberFunction(A);
    }
}
```

This approach also takes care of the issue that function pointers can’t be taken to constructors. By wrapping it in this manner, we simply create a factory method:

```c++
extern "C"
{
    __declspec(dllexport) FLiveLinkMvnSource ConstructFLiveLinkMvnSource(int Port)
    {
        FLiveLinkMvnSource Out(Port);
        return Out;
    }
}
```

Notice that because the types defined inside the optional plugin might not be exposed to the main `DLL`, it could be that we have to wrap
these types in opaque handles that get manually allocated and deallocated. 

Then inside the main `DLL` (i.e. XR-IT Module), we explicitly link each plugin-specific interface Module depending on whether the optional plugin dependency exists.

This satisfies the requirements of:
- Not requiring the user to recompile the plugin themselves based on which plugin is installed (this also enables packaging the plugin for the store / binary distribution).
- Not requiring each plugin to be installed (especially important with e.g. 20 plugins we want to automate).

### TLDR

For each optional plugin dependency, we add a wrapper `DLL` (read "Module"), to which we explicitly link inside the main Xrit `DLL` if that plugin was found. 
Each of these wrapper `DLL`s contains exported `extern "C"` functions, of which we obtain function pointers, which we can call directly inside the Xrit `DLL`. 