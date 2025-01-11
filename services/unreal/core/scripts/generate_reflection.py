import re
import sys
import os

# This script automates the process of writing the reflection macros
# The usage of macros is chosen, instead of directly generating the C++ code,
# because this enables quickly changing the to be generated code, rather than
# having to go back into this python script to modify a single line.

# Admittedly, this approach to reflection is a bit hacky, and modifying the compiler
# / LLVM to generate reflection data might be better.

# However, in an attempt to keep things as simple and transparent as possible, this
# approach was taken.

# Also over something like reflect-cpp, which relies on compiler specific macros and magic
# to get reflection information.


def read_header_file(header_file_path):
    with open(header_file_path, 'r') as file:
        lines = file.read()
    return lines


def strip_multiline_comments(string):
    while True:
        startIndex = string.find('/*')
        if startIndex == -1:
            break  # did not find any multiline comments anymore

        # if we found a /*, we need to find the */
        stopIndex = string.find('*/', startIndex)
        assert stopIndex != -1
        string = string[:startIndex] + string[(stopIndex + len('*/')):]
    return string


def strip_trailing_comments(string):
    while True:
        startIndex = string.find('//')
        if startIndex == -1:
            break # did not find any trailing comments

        # if we found a //, we need to find the \n
        stopIndex = string.find('\n', startIndex)

        if stopIndex == -1:
            # this means it is the end of the file
            string = string[:startIndex]
        else:
            string = string[:startIndex] + string[stopIndex:]
    return string


def strip_preprocessor_directives(string):
    index = 0
    while True:
        endOfLineIndex = string.find('\n', index)
        if endOfLineIndex == -1: # all lines read
            break

        endOfLineIndex += 1 # to also include '\n'

        if string[index] == '#': # if the first character of the line is a #, we remove the entire line
            string = string[:index] + string[endOfLineIndex:] # remove characters between index and the end of the line
            endOfLineIndex -= (endOfLineIndex - index) # the string just got shorter, so we need to update where to start for the next iteration

        index = endOfLineIndex

    return string


# makes all lists of spaces only a single space, and remove spaces where not necessary
def collapse_spaces(string):

    index = 0
    startIndex = 0
    spaces = False
    while True:
        if index >= len(string):
            break

        currentSpace = string[index] == ' '

        # start recording spaces
        if currentSpace and not spaces:
            startIndex = index
            spaces = True

        # stop recording spaces
        if spaces and not currentSpace:
            stopIndex = index - 1 # leave one space

            # collapse space characters into one
            string = string[:startIndex] + string[stopIndex:]
            index -= (stopIndex - startIndex)
            spaces = False

        index += 1

    return string


def strip_unnecessary_spaces(string):
    # we can remove spaces in the following cases:
    # 1. before a curly brace: "struct_Something{" is the same as "struct_Something_{"
    # 2. after a curly brace: "namespace A{namespace B{}}" is the same as "namespace A{namespace B} }"
    string = string.replace(" {", "{")
    string = string.replace("{ ", "{")
    string = string.replace("} ", "}")
    string = string.replace(" }", "}")

    # 3. after a semicolon: "struct Something{};struct SomethingElse{};" is the same as "struct Something{}; struct SomethingElse{};"
    string = string.replace("; ", ";")

    return string


# get where the current curly braces depth ends
# character at beginIndex should be {
def get_stack_end_index(string, beginIndex):
    stackDepth = 0
    endIndex = 0
    bracesIndex = beginIndex
    while True:
        character = string[bracesIndex]

        if character == '{':
            stackDepth += 1
        elif character == '}':
            stackDepth -= 1

        if stackDepth == 0:
            # end of the namespace
            endIndex = bracesIndex
            break

        bracesIndex += 1
    return endIndex

# returns the ranges for all namespaces in the file
# these can overlap, so should be processed afterwards
def get_namespace_ranges(string):
    namespaceRanges = []

    startIndex = 0
    while True:
        startIndex = string.find("namespace", startIndex)
        if startIndex == -1:
            break
        startIndex += len("namespace ")
        stopIndex = string.find('{', startIndex)

        # get the namespace identifier
        namespaceName = string[startIndex:stopIndex]

        startIndex = stopIndex

        # inside a namespace we have an arbitrary amount of braces which need to be skipped, but once we find the
        # closing brace at the level of the namespace, we "close" the namespace
        # data: namespace bla::something{ {}{}{}{{{{}}} } <-- close namespace

        namespaceBeginIndex = startIndex
        namespaceEndIndex = get_stack_end_index(string, namespaceBeginIndex)
        namespaceRanges.append([namespaceName, namespaceBeginIndex, namespaceEndIndex])

    return namespaceRanges


# get the namespace identifier at the given index
# because the namespaceRanges can overlap, it will concatenate this into
# "something::another_one" with "::" as the separator
def get_namespace_identifier(index, namespaceRanges):
    namespaceList = []
    for namespaceRange in namespaceRanges:
        namespaceName = namespaceRange[0]
        beginIndex = namespaceRange[1]
        endIndex = namespaceRange[2]
        if index >= beginIndex and index <= endIndex:
            namespaceList.append(namespaceName)

    # now concatenate the namespaces
    # we assume these are in order, so we don't need to sort them
    return "::".join(namespaceList)


def get_structs(string, namespaceRanges):
    structs = []

    i = 0
    while True:
        identifier = string.find("REFLECT_STRUCT", i)
        if identifier == -1:
            break

        # get struct name
        length = len("struct ")
        startIndex = string.find("struct ", identifier)
        if startIndex == -1:
            startIndex = string.find("class ", identifier)
            length = len("class ")
        assert startIndex != -1
        stopIndex = string.find('{', startIndex)
        assert stopIndex != -1

        structName = string[(startIndex + length):stopIndex]

        # get namespace identifier for this struct
        namespace = get_namespace_identifier(startIndex, namespaceRanges)

        # iterate over all fields inside the struct
        fieldsStartIndex = stopIndex
        fieldsEndIndex = get_stack_end_index(string, fieldsStartIndex)

        fieldsIndex = fieldsStartIndex
        fields = []
        while True:
            fieldNameStartIndex = string.find("REFLECT(", fieldsIndex, fieldsEndIndex)
            if fieldNameStartIndex == -1:
                break
            fieldNameStartIndex += len("REFLECT(")
            fieldNameStopIndex = string.find(')', fieldNameStartIndex)
            assert fieldNameStopIndex != -1

            fieldName = string[fieldNameStartIndex:fieldNameStopIndex]
            fields.append(fieldName)

            fieldsIndex = fieldNameStopIndex

        struct = [structName, namespace, fields]
        structs.append(struct)

        i = stopIndex

    return structs


def get_enums(string, namespaceRanges):
    enums = []

    # get enum name
    i = 0
    while True:
        identifier = string.find("REFLECT_ENUM", i)
        if identifier == -1:
            break

        startIndex = string.find("enum class ", identifier)
        assert startIndex != -1
        startIndex += len("enum class ")
        stopIndex = string.find('{', startIndex)
        assert stopIndex != -1
        enumName = string[startIndex:stopIndex]

        namespace = get_namespace_identifier(identifier, namespaceRanges)

        # iterate over cases
        # count is guaranteed to be the last case, so we use that as the end index
        casesEndIndex = get_stack_end_index(string, stopIndex)
        assert casesEndIndex != -1

        previousCommaIndex = stopIndex
        cases = []
        while True:

            commaIndex = string.find(',', previousCommaIndex+1, casesEndIndex)
            if commaIndex == -1:
                break
            cases.append(string[previousCommaIndex + 1:commaIndex].replace(' ', ''))
            previousCommaIndex = commaIndex

        # add last case
        cases.append(string[previousCommaIndex + 1:casesEndIndex].replace(' ', ''))
        enums.append([enumName, namespace, cases])

        i = stopIndex

    return enums


def generate_struct_reflection(structs):
    output = ""
    for struct in structs:
        structName = struct[0]
        namespace = struct[1]
        fields = struct[2]

        if namespace != '':
            structName = namespace + "::" + structName
        output += "REFLECT_IMPL_STRUCT_BEGIN(" + structName + ")\n"

        for field in fields:
            output += "    REFLECT_IMPL_FIELD(" + field + ")\n"

        output += "REFLECT_IMPL_STRUCT_END\n\n"

    return output


def generate_enum_reflection(enums):
    output = ""
    for enum in enums:
        enumName = enum[0]
        namespace = enum[1]
        cases = enum[2]

        if namespace != '':
            enumName = namespace + "::" + enumName
        output += "REFLECT_IMPL_ENUM_BEGIN(" + enumName + ")\n"

        for case in cases:
            if case == "Invalid" or case == "Count":
                continue
            output += "    REFLECT_IMPL_CASE(" + case + ")\n"

        output += "REFLECT_IMPL_ENUM_END\n\n"

    return output


def generate_reflection_for_file(header_file_path):
    # Check if output file has .h extension
    if not header_file_path.endswith('.h'):
        print("Error: Input file must have a .h extension")
        sys.exit(1)

    # output file path adds _generated
    output_file_path = header_file_path[:-2] + "_generated.h"

    # Delete the output file if it exists
    if os.path.exists(output_file_path):
        os.remove(output_file_path)

    # Check if input file exists
    if not os.path.exists(header_file_path):
        print(f"Error: Input file '{header_file_path}' does not exist.")
        sys.exit(1)

    string = read_header_file(header_file_path)

    # clean up so that only useful characters remain
    string = strip_preprocessor_directives(string)
    string = strip_multiline_comments(string)
    string = strip_trailing_comments(string)
    string = string.replace('\n', ' ') # now we can safely remove newlines, as the trailing comments and preprocessor directives are stripped
    string = string.replace('\t', ' ') # replace tabs with spaces
    string = collapse_spaces(string)
    string = strip_unnecessary_spaces(string)
    if string.startswith(' '): # strip leading space
        string = string[1:]

    # string = string.replace(' ', '_').replace('\n', '\n^')
    #print("\n\n" + string + "\n\n")

    # get namespace ranges
    namespaceRanges = get_namespace_ranges(string)

    # get structs and their fields
    structs = get_structs(string, namespaceRanges)
    # for struct in structs:
    #     print(struct)

    enums = get_enums(string, namespaceRanges)
    # for enum in enums:
    #     print(enum)

    if len(structs) == 0 and len(enums) == 0:
        print(f'Skipped {header_file_path}')
        return False

    # generate code
    structReflection = generate_struct_reflection(structs)
    print(structReflection)

    enumReflection = generate_enum_reflection(enums)
    print(enumReflection)

    header = ""
    header += "// -----------------------------------------------------------\n"
    header += "// automatically generated with scripts/generate_reflection.py\n"
    header += "// don't edit this file directly.\n"
    header += "// -----------------------------------------------------------\n\n"
    outputString = header + structReflection + enumReflection

    # Output the generated code to the output header file
    with open(output_file_path, 'w') as output_file:
        output_file.write(outputString)
    print(f'Reflection code has been generated in {output_file_path}')


def main():
    if len(sys.argv) != 2:
        print("Usage: python generate_reflection.py <input_header_file.h>")
        sys.exit(1)

    header_file_path = sys.argv[1]
    generate_reflection_for_file(header_file_path)


if __name__ == '__main__':
    main()
