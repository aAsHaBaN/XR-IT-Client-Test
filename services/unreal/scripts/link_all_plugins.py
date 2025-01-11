from link_plugin import linkPlugin

import os
import sys


def main():
    if len(sys.argv) != 2:
        print("Usage: python link_all_plugins.py <path/to/unreal/project>")
        sys.exit(1)

    unrealProjectDirectory = sys.argv[1]

    file_path = os.path.realpath(__file__)
    scriptsDirectory = os.path.dirname(file_path)
    unrealDirectory = os.path.dirname(scriptsDirectory)

    linkPlugin(os.path.join(unrealDirectory, "unreal_plugin"), unrealProjectDirectory, "Xrit")
    linkPlugin(os.path.join(unrealDirectory, "dummy_plugin"), unrealProjectDirectory, "DummyPlugin")


if __name__ == '__main__':
    main()