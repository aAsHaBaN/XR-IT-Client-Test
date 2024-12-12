import os
from generate_reflection import generate_reflection_for_file


def main():
    file_path = os.path.realpath(__file__)
    scriptsDirectory = os.path.dirname(file_path)
    coreDirectory = os.path.dirname(scriptsDirectory)
    includeDirectory = os.path.join(coreDirectory, "include")

    for root, dirs, files in os.walk(includeDirectory):
        for file in files:
            if file.endswith('_generated.h'):
                continue
            if not file.endswith('.h'):
                continue
            fullPath = os.path.join(root, file)
            generate_reflection_for_file(fullPath)


if __name__ == '__main__':
    main()