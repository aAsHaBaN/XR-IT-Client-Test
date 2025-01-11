#ifndef XRIT_UNREAL_COMMUNICATION_PROTOCOL_H
#define XRIT_UNREAL_COMMUNICATION_PROTOCOL_H

#include "data/communication_protocol.h"

namespace xrit_unreal
{
// a message from the Xrit Node to the Unreal service
struct UnrealMessageData
{
    UnrealCommand command;
    std::string_view data;
};

// a message from the Unreal service to the Xrit Node
struct NodeMessageData
{
    NodeCommand command;
    std::string_view data;
};

// returns true if message is well-formed, otherwise returns false
// sets outMessage on success
[[nodiscard]] bool getMessageData(std::string_view message, MessageData *outMessage);

// returns true if valid unreal message, otherwise returns false
// if valid message, sets outMessage's values
[[nodiscard]] bool getUnrealMessage(MessageData const &message, UnrealMessageData &outMessage);

// returns true if valid node message, otherwise returns false
// if valid message, sets outMessage's values
[[nodiscard]] bool getNodeMessage(MessageData const &message, NodeMessageData &outMessage);

// creates a string that can be sent over the network to the node
[[nodiscard]] std::string createNodeMessage(NodeCommand nodeCommand, std::string_view data);

// the plugin should never need to create such a message, but for mocking it can be useful
[[nodiscard]] std::string createMockUnrealMessage(UnrealCommand unrealCommand, std::string_view data);
} // namespace xrit_unreal

#endif // XRIT_UNREAL_COMMUNICATION_PROTOCOL_H