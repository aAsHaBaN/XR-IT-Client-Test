import os
import sys

def linkPlugin(pluginPath, unrealProjectDirectory, pluginName):
    if not os.path.exists(unrealProjectDirectory):
        print("Error: Supplied Unreal project path does not exist")
        sys.exit(1)

    if not os.path.isdir(unrealProjectDirectory):
        print("Error: Supplied Unreal project path is not a directory")
        sys.exit(1)

    # Create Plugins folder if it doesn't exist already inside the Unreal project directory
    unrealProjectPluginsDirectory = os.path.join(unrealProjectDirectory, "Plugins")
    if not os.path.exists(unrealProjectPluginsDirectory):
        os.mkdir(unrealProjectPluginsDirectory)

    # remove existing folder / Symlink
    targetPluginPath = os.path.join(unrealProjectPluginsDirectory, pluginName)
    if os.path.exists(targetPluginPath):
        if not os.path.islink(targetPluginPath):
            print("Error: There already is an existing folder in the project directory, which is not a symlink. Please delete the directory manually")
            sys.exit(1)
        os.remove(targetPluginPath)

    # create symbolic link
    os.symlink(pluginPath, targetPluginPath, True)
    print("Created symbolic link for: ", pluginPath, " to ", targetPluginPath)


def main():
    if len(sys.argv) != 4:
        print("Usage: python add_plugin_to_project.py <path/to/plugin> <plugin_name> <path/to/unreal/project>")
        sys.exit(1)

    pluginPath = sys.argv[1]
    pluginName = sys.argv[2]
    unrealProjectDirectory = sys.argv[3]

    linkPlugin(pluginPath, unrealProjectDirectory, pluginName)


if __name__ == "__main__":
    main()