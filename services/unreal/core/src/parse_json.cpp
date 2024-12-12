#include "parse_json.h"

namespace xrit_unreal
{
simdjson::error_code parseJson(std::string_view json, JsonDocument &outDocument)
{
    if (json.empty())
    {
        return simdjson::error_code::EMPTY;
    }

    outDocument.paddedJson = simdjson::padded_string{json};

    return outDocument.parser.iterate(outDocument.paddedJson).get(outDocument.document);
}
} // namespace xrit_unreal