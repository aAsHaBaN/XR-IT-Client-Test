#ifndef XRIT_UNREAL_PARSE_JSON_H
#define XRIT_UNREAL_PARSE_JSON_H

#include <simdjson.h>

namespace xrit_unreal
{
// holds data for iteration and parsing
struct JsonDocument
{
    simdjson::padded_string paddedJson;
    simdjson::ondemand::parser parser;
    simdjson::ondemand::document document;
};

// convenience method for setting the parser, document and padded json as seen in JsonDocument
[[nodiscard]] simdjson::error_code parseJson(std::string_view json, JsonDocument &out);
} // namespace xrit_unreal

#endif // XRIT_UNREAL_PARSE_JSON_H