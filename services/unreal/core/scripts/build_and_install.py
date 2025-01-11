import sys
import os
import platform
import subprocess
from shutil import rmtree

# this builds and installs core so that it can be used by the unreal plugin,

buildDirectory = ["build", "debug_unreal"]
cmakeArguments = ["-DBUILD_FOR_UNREAL=ON", "-DLWS_WITH_SSL=OFF", "-DLWS_WITH_MINIMAL_EXAMPLES=OFF"]


def windows():
    return platform.system() == "Windows"


def macOS():
    return platform.system() == "Darwin"


def getAbsoluteBuildDirectory(coreDirectory):
    out = coreDirectory
    for dir in buildDirectory:
        out = os.path.join(out, dir)
    return out


def configure(coreDirectory, buildDirectory, generator, fresh):
    command = ["cmake", "-B", buildDirectory, coreDirectory, "-G", generator] + cmakeArguments
    if fresh:
        command += ["--fresh"]
    print(command)
    subprocess.run(command)
    pass


def build(buildDirectory):
    # cmake --build build --target xrit_unreal --config Debug --clean-first
    command = ["cmake", "--build", buildDirectory, "--target", "xrit_unreal", "--config", "Debug"]#, "--clean-first"]
    print(command)
    subprocess.run(command)
    pass



def install(buildDirectory):
    # cmake --install build --component xrit_unreal --config Debug
    command = ["cmake", "--install", buildDirectory, "--component", "xrit_unreal", "--config", "Debug"]
    print(command)
    subprocess.run(command)
    pass


def main():
    # whether to regenerate the entire Cmake project
    fresh = False
    if "fresh" in sys.argv:
        fresh = True

    file_path = os.path.realpath(__file__)
    scriptsDirectory = os.path.dirname(file_path)
    coreDirectory = os.path.dirname(scriptsDirectory)
    buildDirectory = getAbsoluteBuildDirectory(coreDirectory)
    unrealDirectory = os.path.dirname(coreDirectory)
    installDirectory = os.path.join(unrealDirectory, "unreal_plugin", "Source", "XritCore", "xrit_unreal_core")
    print("build directory: " + buildDirectory)

    # select generator depending on platform
    generator = ""
    if windows():
        generator = "Visual Studio 17 2022"
    elif macOS(): # i.e. macOS
        generator = "Ninja"
    else:
        print("unsupported platform, please use macOS or Windows")
        exit(1)

    # configure the cmake project
    configure(coreDirectory, buildDirectory, generator, fresh)

    # build the cmake target
    build(buildDirectory)

    # clean install directory (e.g. for left over header files)
    print("cleaning install directory: " + installDirectory)
    if os.path.exists(installDirectory):
        rmtree(installDirectory)

    # install the libs and header files to the build directory
    install(buildDirectory)


if __name__ == "__main__":
    main()