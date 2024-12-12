cmake_minimum_required(VERSION 3.26)
project(xrit_unreal)

if(POLICY CMP0091)
    cmake_policy(SET CMP0091 NEW)
endif()

set(CMAKE_CXX_STANDARD 20)

# options for libwebsockets
option(LWS_WITH_SECURE_STREAMS_STATIC_POLICY_ONLY "Static policy" OFF)
set(LWS_WITH_SECURE_STREAMS_STATIC_POLICY_ONLY ON)

option(BUILD_FOR_UNREAL "Whether to build for Unreal, this has some additional requirements, such as selecting the same C runtime library that Unreal uses" OFF)

# install location
set(CMAKE_INSTALL_PREFIX ${CMAKE_CURRENT_SOURCE_DIR}/../unreal_plugin/Source/XritCore/xrit_unreal_core)

add_subdirectory(external)
add_subdirectory(tests)
add_subdirectory(experiments)

set(CORE_SOURCES
        src/reflect/parse.cpp
        src/reflect/serialize.cpp
        src/communication_protocol.cpp
        src/generate_mock_data.cpp
        src/guid.cpp
        src/livelink.cpp
        src/parse_json.cpp
        src/websocket.cpp
)

add_library(xrit_unreal ${CORE_SOURCES})
target_link_libraries(xrit_unreal PRIVATE simdjson websockets)

if (WIN32 AND BUILD_FOR_UNREAL)
    add_compile_definitions(_ITERATOR_DEBUG_LEVEL=0)
    set_target_properties(xrit_unreal PROPERTIES MSVC_RUNTIME_LIBRARY "MultiThreadedDLL")
    set_target_properties(simdjson PROPERTIES MSVC_RUNTIME_LIBRARY "MultiThreadedDLL")
    set_target_properties(websockets PROPERTIES MSVC_RUNTIME_LIBRARY "MultiThreadedDLL")
endif()

# include directories
target_include_directories(xrit_unreal PRIVATE include/xrit_unreal) # to avoid having to specify #include "xrit_unreal/some_header.h" instead of #include "some_header.h" in sources of this target
target_include_directories(xrit_unreal PUBLIC include)

#--------------------------------------------------
# install

# copy archive files (.a extension)
install(TARGETS xrit_unreal simdjson websockets ARCHIVE DESTINATION lib COMPONENT xrit_unreal)

# copy header files
install(DIRECTORY external/libwebsockets/include DESTINATION . COMPONENT xrit_unreal)
install(DIRECTORY external/simdjson/include DESTINATION . COMPONENT xrit_unreal)
install(DIRECTORY include DESTINATION . COMPONENT xrit_unreal)