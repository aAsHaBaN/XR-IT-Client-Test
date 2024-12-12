# Development

ℹ️ Building from source is only required during development. Otherwise, use the packaged XRIT plugin at [link here (TODO)]().

ℹ️ Text in the following commands between `<` and `>` are placeholders and should be replaced.

## Build and run from source

### Requirements

- [`cmake >= 3.26`](https://cmake.org/download/)
- [`Unreal Engine >= 5.3`](https://www.unrealengine.com/)
- [`python >= 3.12`](https://www.python.org/downloads/)

### Build and install the `core` module

```sh
python services/unreal/core/scripts/build_and_install.py
```

Add `fresh` if you want to regenerate the Cmake project each time you run the script. 

### Option 1: Add to Unreal project

Manually create a new Unreal project, or use an existing one. 

Then, add the plugin to the Unreal project using the following script (using admin privileges on Windows):
```sh
python services/unreal/scripts/add_plugin_to_unreal_project.py <path to unreal project>
```

Open the project in Unreal Engine, or run the project **JetBrains Rider** or **Visual Studio** for debugging support and
getting detailed build errors. Build errors are also logged by Unreal Engine in a logging directory, see documentation
for the Unreal Build Tool.

Inside Unreal Engine, enable the `Xrit` plugin. 

### Option 2: Build using UnrealBuildTool
Todo