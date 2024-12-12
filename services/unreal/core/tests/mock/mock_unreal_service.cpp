#include <xrit_unreal/websocket.h>
#include <xrit_unreal/communication_protocol.h>
#include <xrit_unreal/generate_mock_data.h>

using namespace xrit_unreal;

#include <iostream>
#include <cassert>

class MockUnrealService final : public IWebSocketListener
{
public:
    explicit MockUnrealService(WebSocket* webSocket_) : webSocket(webSocket_)
    {

    }

    ~MockUnrealService() = default; // IWebSocketListener is abstract so don't need to override destructor

    // IWebSocketListener implementation
    void onConnected(WebSocket* caller) override
    {
        std::cout << "mock unreal service: onConnected" << std::endl;
        caller->sendMessage(createNodeMessage(NodeCommand::initialized, ""));
    }

    void onDisconnected(WebSocket* caller) override
    {
        std::cout << "mock unreal service: onDisconnected" << std::endl;
    }

    void onMessage(WebSocket* caller, std::string message) override
    {
        std::cout << "mock unreal service: onMessage: " << message << std::endl;
        MessageData data;
        assert(getMessageData(message, &data));
        UnrealMessageData unrealMessage;
        assert(getUnrealMessage(data, unrealMessage));

        switch (unrealMessage.command)
        {
            case UnrealCommand::set_configuration:
            {
                // set config

                // send back response
                caller->sendMessage(createNodeMessage(NodeCommand::set_configuration_result, generateMockSetConfigurationResultSuccess()));

                // communicate status changed
                caller->sendMessage(createNodeMessage(NodeCommand::status, generateMockStatus()));
                break;
            }
            case UnrealCommand::get_status:
            {
                // force status update
                caller->sendMessage(createNodeMessage(NodeCommand::status, generateMockStatus()));
                break;
            }
            default:
                assert(false);
        }
    }

private:
    WebSocket* webSocket;
};

int main(int argc, char const** argv)
{
    WebSocketConfiguration config{
        .url = "127.0.0.1",
        .port = 5000,
        .maxBytesPerFrame = 1024,
        .server = false,
    };
    WebSocket webSocket(config);
    MockUnrealService service(&webSocket);
    webSocket.listener = &service;
    webSocket.run();

    return 0;
}