# client (for interfacing with websocket_server)

set(SOURCES
        websocket_client.cpp
)
add_executable(websocket_client ${SOURCES})
target_link_libraries(websocket_client websockets)