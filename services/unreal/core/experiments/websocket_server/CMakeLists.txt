set(SOURCES
        websocket_server.cpp
)

add_executable(websocket_server ${SOURCES})

target_link_libraries(websocket_server websockets)