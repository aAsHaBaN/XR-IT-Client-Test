#ifndef XRIT_UNREAL_DATA_COMMUNICATION_PROTOCOL_H
#define XRIT_UNREAL_DATA_COMMUNICATION_PROTOCOL_H

#include "../reflect/reflect.h"

#include <string_view>

namespace xrit_unreal
{
// decomposes incoming messages into the channel, command and supplied data
//
// message structure is expected to be in the form of:
// "channel:command\ndata".
// i.e. channel is followed with a colon (:), and command is followed with a return (\n)
// if there is no data, there does not need to be a \n
struct MessageData
{
    std::string_view channel;
    std::string_view command;
    std::string_view data;
};

REFLECT_ENUM

enum class Channel
{
    Invalid,
    unreal_to_node,
    node_to_unreal,
    Count
};

// enums are used here to make communication more explicitly defined in code,
// rather than having to source through if-else statements somewhere in the unreal plugin

// list of commands that can be sent from the XRIT node to the unreal service
REFLECT_ENUM

enum class UnrealCommand
{
    Invalid,
    set_configuration,
    get_status,
    Count
};

// list of commands that can be sent from the unreal service to the XRIT node.
// node command can't be invalid
REFLECT_ENUM

enum class NodeCommand
{
    Invalid,
    initialized,
    set_configuration_result,
    status,
    Count
};
} // namespace xrit_unreal

#include "communication_protocol_generated.h"

#endif // XRIT_UNREAL_DATA_COMMUNICATION_PROTOCOL_H