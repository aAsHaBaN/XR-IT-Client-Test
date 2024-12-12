# XRIT Unreal Engine plugin

## Communication protocol

Communication protocol between the **XR-IT Node** and the **Unreal Engine plugin** happens over an unsecure Websocket connection.

See [data/communication_protocol.h](core/include/xrit_unreal/data/communication_protocol.h) for a description of which messages are supported by the **Unreal Engine plugin**,
and which messages are sent back.

## Data

The data that is accepted by the **Unreal Engine plugin**, and what data is sent back to the **XR-IT Node** is outlined in the header files inside 
[data](core/include/xrit_unreal/data). See [data/configuration.h](core/include/xrit_unreal/data/configuration.h) for the main entrypoint for the
data accepted and sent back by the **Unreal Engine plugin**. 

## Development

### Building

For building `core` and `unreal_plugin` from source, and for running the plugin in Unreal Engine, please read [build.md](doc/build.md).

### Modules

Creating a separate module `core` that does not depend on Unreal Engine has the benefit of improving iteration times as we don't have to wait for Unreal to start up after each code change, and it enables testing via [GoogleTest](https://github.com/google/googletest).

### [`core`](core)

`core` contains C++ code for handling communication with an XRIT Node via Websockets, and json serialization / deserialization of configuration data and connection statuses.

### [`unreal_plugin`](unreal_plugin)

`unreal_plugin` is the Unreal Engine plugin that interacts with Unreal Engine to configure settings such as LiveLink. `unreal_plugin` depends on `core`.

### Generated code and reflection

A simple reflection system is implemented using macros to make serializing and deserializing from and to json using simdjson less tedious. 

After changing any types that have reflection (e.g. via `REFLECT_ENUM` or `REFLECT_STRUCT`), please run 
[scripts/generate_all_reflection.py](core/scripts/generate_all_reflection.py). This will iterate over all header files and generate an accompanying 
`_generated.h` file.

The `_generated.h` file is not automatically added as an `#include` to its source header file, so this should be done manually. See for example: 

`foo.h`:
```c++
REFLECT_STRUCT
struct Foo
{
    uint64_t REFLECT(bar);
};

REFLECT_ENUM
enum class Something
{
    Invalid, // default, should be included
    One,
    Two,
    Three
    Count // default, should be included
};

#include "foo_generated.h"
```

### Optional plugin dependencies

For each optional plugin dependency, we add a wrapper `DLL` (read "Module"), to which we explicitly link inside the main Xrit `DLL` if that plugin was found.
Each of these wrapper `DLL`s contains exported `extern "C"` functions, of which we obtain function pointers, which we can call directly inside the Xrit `DLL`. 

These wrappers are found in [`unreal_plugin/Source/Integrations`](unreal_plugin/Source/Integrations). 

### Tests

Tests use Google Test and are located in the [tests](core/tests) directory.

### Coding style

Please refer to [coding_style.md](doc/coding_style.md) for the coding style used in this project. 