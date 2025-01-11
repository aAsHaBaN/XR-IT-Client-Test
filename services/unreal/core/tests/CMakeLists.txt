project(xrit_unreal_tests)

add_subdirectory(external/googletest)

add_subdirectory(mock)

set(TESTS_SOURCES
        communication_protocol.cpp
        configuration.cpp
        guid.cpp
        livelink.cpp
        parse_json.cpp
        reflect.cpp
)

add_executable(xrit_unreal_tests ${TESTS_SOURCES})

target_link_libraries(xrit_unreal_tests PUBLIC gtest_main xrit_unreal)
target_link_libraries(xrit_unreal_tests PRIVATE simdjson websockets)