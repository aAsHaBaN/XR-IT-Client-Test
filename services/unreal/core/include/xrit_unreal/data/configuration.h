#ifndef XRIT_UNREAL_CONFIGURATION_H
#define XRIT_UNREAL_CONFIGURATION_H

#include "common.h"
#include "livelink.h"

#include "../reflect/reflect.h"

namespace xrit_unreal
{
REFLECT_STRUCT

struct Ip
{
    std::string_view REFLECT(url) = "127.0.0.1";
    std::int64_t REFLECT(port) = 8000;
};

REFLECT_STRUCT

struct Configuration
{
    Ip REFLECT(udp_unicast_endpoint);
    LiveLink REFLECT(livelink);
};

// this is the result that gets sent back by the Unreal plugin to the XR-IT Node
// to show what kind of errors exist in the provided configuration json.
// success means no errors (all lists are empty)
REFLECT_STRUCT

struct SetConfigurationResult
{
    // parse errors are related to whether the parsing of the json failed
    std::vector<ParseError> REFLECT(parse_errors);

    // these are specific to whether the operation executed to reflect the configuration data
    // succeeded.
    std::vector<LiveLinkError> REFLECT(livelink_errors);
};
} // namespace xrit_unreal

#include "configuration_generated.h"

#endif // XRIT_UNREAL_CONFIGURATION_H