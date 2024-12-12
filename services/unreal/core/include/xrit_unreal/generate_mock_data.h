#ifndef XRIT_UNREAL_GENERATE_MOCK_DATA_H
#define XRIT_UNREAL_GENERATE_MOCK_DATA_H

#include "guid.h"
#include <string>

namespace xrit_unreal
{
// purely the data
[[nodiscard]] std::string generateMockConfiguration();

[[nodiscard]] std::string generateMockSetConfigurationResultSuccess();

[[nodiscard]] std::string generateMockSetConfigurationResultParseError();

[[nodiscard]] std::string generateMockStatus();

// this is not random enough to be a true guid generator
[[nodiscard]] Guid generateMockGuid();

// adds indentations to the provided json string
// indentationCount is the amount of spaces or tabs
// indentationCharacter is the character to use for indentation (e.g. spaces or tabs)
constexpr uint32_t defaultIndentationAmount = 4;
[[nodiscard]] std::string prettifyJson(std::string_view json, uint32_t indentationCount = defaultIndentationAmount,
                                       char indentationCharacter = ' ');
} // namespace xrit_unreal

#endif // XRIT_UNREAL_GENERATE_MOCK_DATA_H