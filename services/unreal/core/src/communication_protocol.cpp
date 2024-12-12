#include "communication_protocol.h"

#include <cassert>
#include <iostream>

namespace xrit_unreal
{
bool getMessageData(std::string_view message, MessageData *outMessage)
{
    size_t const commandIndex = message.find_first_of(':', 0);
    if (commandIndex == std::string::npos)
    {
        // invalid
        return false;
    }

    outMessage->channel = message.substr(0, commandIndex);

    size_t const dataIndex = message.find_first_of('\n', commandIndex);
    if (dataIndex == std::string::npos)
    {
        // valid, but we don't have data, only command
        outMessage->command = message.substr(commandIndex + 1, message.size() - 1);
        outMessage->data = std::string_view();
    }
    else
    {
        // valid data found
        outMessage->command = message.substr(commandIndex + 1, dataIndex - commandIndex - 1);
        outMessage->data = message.substr(dataIndex + 1, message.size() - dataIndex - 1);
    }

    return true;
}

bool getUnrealMessage(MessageData const &message, UnrealMessageData &outMessage)
{
    if (parseEnum<Channel>(message.channel) == Channel::node_to_unreal)
    {
        outMessage.command = parseEnum<UnrealCommand>(message.command);
        outMessage.data = message.data;
        return true;
    }
    else
    {
        return false;
    }
}

bool getNodeMessage(MessageData const &message, NodeMessageData &outMessage)
{
    if (parseEnum<Channel>(message.channel) == Channel::unreal_to_node)
    {
        outMessage.command = parseEnum<NodeCommand>(message.command);
        outMessage.data = message.data;
        return true;
    }
    else
    {
        return false;
    }
}

// create message for the node
std::string createNodeMessage(NodeCommand nodeCommand, std::string_view data)
{
    assert(nodeCommand < NodeCommand::Count && nodeCommand != NodeCommand::Invalid);

    std::string result;
    result += serializeEnum(Channel::unreal_to_node);
    result += ":";
    result += serializeEnum(nodeCommand);

    if (!data.empty())
    {
        result += "\n";
        result += data;
    }
    return result;
}

// create message for unreal
std::string createMockUnrealMessage(UnrealCommand unrealCommand, std::string_view data)
{
    assert(unrealCommand < UnrealCommand::Count && unrealCommand != UnrealCommand::Invalid);

    std::string result;
    result += serializeEnum(Channel::node_to_unreal);
    result += ":";
    result += serializeEnum(unrealCommand);

    if (!data.empty())
    {
        result += "\n";
        result += data;
    }
    return result;
}
} // namespace xrit_unreal