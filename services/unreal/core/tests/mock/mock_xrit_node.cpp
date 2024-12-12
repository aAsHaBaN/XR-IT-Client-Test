#include <xrit_unreal/websocket.h>
#include <xrit_unreal/communication_protocol.h>
#include <xrit_unreal/generate_mock_data.h>

using namespace xrit_unreal;

#include <iostream>
#include <cassert>

namespace mock_xrit_node
{
    class MockXritNode final : public IWebSocketListener
    {
    public:
        explicit MockXritNode(WebSocket* webSocket_) : webSocket(webSocket_)
        {

        }

        ~MockXritNode() = default; // IWebSocketListener is abstract so don't need to override destructor

        // IWebSocketListener implementation
        void onConnected(WebSocket* caller) override
        {
            std::cout << "mock xrit node: onConnected" << std::endl;
        }

        void onDisconnected(WebSocket* caller) override
        {
            std::cout << "mock xrit node: onDisconnected" << std::endl;
        }

        void onMessage(WebSocket* caller, std::string message) override
        {
            std::cout << "mock xrit node: onMessage: " << message << std::endl;

            MessageData data;
            assert(getMessageData(message, &data));
            NodeMessageData nodeMessage;
            assert(getNodeMessage(data, nodeMessage));

            switch (nodeMessage.command)
            {
                case NodeCommand::initialized:
                {
                    // immediately set config when the unreal service is initialized
                    caller->sendMessage(createMockUnrealMessage(UnrealCommand::set_configuration, generateMockConfiguration()));

                    caller->sendMessage(createMockUnrealMessage(UnrealCommand::get_status, ""));
                    break;
                }
                case NodeCommand::set_configuration_result:
                {
                    std::cout << "received set_configuration_result" << std::endl;
                    break;
                }
                case NodeCommand::status:
                {
                    std::cout << "received status:" << std::endl;
                    std::cout <<  xrit_unreal::prettifyJson(nodeMessage.data, 2) << std::endl;
                    break;
                }
                default:
                {
                    assert(false);
                }
            }
        }

    private:
        WebSocket* webSocket;
    };
}

int main(int argc, char const** argv)
{
    WebSocketConfiguration config{
        .url = "127.0.0.1",
        .port = 5000,
        .maxBytesPerFrame = 1024,
        .server = true
    };
    WebSocket webSocket(config);
    mock_xrit_node::MockXritNode node(&webSocket);
    webSocket.listener = &node;
    webSocket.run();
    return 0;
}