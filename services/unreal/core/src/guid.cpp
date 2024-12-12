#include "guid.h"

#include <iomanip>
#include <sstream>

namespace xrit_unreal
{
bool operator==(Guid const &lhs, Guid const &rhs)
{
    return lhs.a == rhs.a && lhs.b == rhs.b && lhs.c == rhs.c && lhs.d == rhs.d;
}

bool operator!=(Guid const &lhs, Guid const &rhs)
{
    return !(lhs == rhs);
}

bool isHexCharacter(char character)
{
    return isxdigit(character);
}

uint32_t parseHexCharacter(char c)
{
    if (c >= '0' && c <= '9')
    {
        return c - '0';
    }
    else if (c >= 'a' && c <= 'f')
    {
        return c + 10 - 'a';
    }
    else if (c >= 'A' && c <= 'F')
    {
        return c + 10 - 'A';
    }
    else
    {
        return 0;
    }
}

uint32_t parseHexNumber32Bits(std::string_view string)
{
    assert(string.size() == 8);

    uint32_t result = 0;

    // one hex character is 4 bits
    for (char character : string)
    {
        // left shift when result is 0 remains 0
        result <<= 4; // 4 bits
        result += parseHexCharacter(character);
    }

    return result;
}

std::vector<ParseError> parseGuid(std::string_view value, Guid &outGuid, std::string_view fieldName)
{
    if (value.length() != 36)
    {
        return {(ParseError{ParseErrorCode::InvalidValue, fieldName, value, "guid string should have length 36"})};
    }
    if (value[8] != '-' || value[13] != '-' || value[18] != '-' || value[23] != '-')
    {
        return {(ParseError{ParseErrorCode::InvalidValue, fieldName, value,
                            "guid hyphen placement is incorrect, expected: 00000000-0000-0000-0000-000000000000"})};
    }

    // create string without hyphens
    std::string stringWithoutHyphens;
    stringWithoutHyphens.reserve(32);
    stringWithoutHyphens += value.substr(0, 8);
    stringWithoutHyphens += value.substr(9, 4);
    stringWithoutHyphens += value.substr(14, 4);
    stringWithoutHyphens += value.substr(19, 4);
    stringWithoutHyphens += value.substr(24, 12);

    for (char character : stringWithoutHyphens)
    {
        if (!isHexCharacter(character))
        {
            return {(ParseError{ParseErrorCode::InvalidValue, fieldName, value,
                                "guid characters should be valid hex characters"})};
        }
    }

    outGuid = {.a = parseHexNumber32Bits(stringWithoutHyphens.substr(0, 8)),
               .b = parseHexNumber32Bits(stringWithoutHyphens.substr(8, 8)),
               .c = parseHexNumber32Bits(stringWithoutHyphens.substr(16, 8)),
               .d = parseHexNumber32Bits(stringWithoutHyphens.substr(24, 8))};
    return {};
}

void serializeInt32ToHex(uint32_t value, std::ostringstream &out)
{
    out << std::setw(8) << std::setfill('0') << std::hex << value;
}

std::string serializeGuid(Guid const &guid)
{
    std::ostringstream streamWithoutHyphens;
    serializeInt32ToHex(guid.a, streamWithoutHyphens);
    serializeInt32ToHex(guid.b, streamWithoutHyphens);
    serializeInt32ToHex(guid.c, streamWithoutHyphens);
    serializeInt32ToHex(guid.d, streamWithoutHyphens);

    // hyphenate
    std::string stringWithoutHyphens = streamWithoutHyphens.str();
    std::string stringWithHyphens;
    stringWithHyphens.reserve(36);
    stringWithHyphens += stringWithoutHyphens.substr(0, 8);
    stringWithHyphens += "-";
    stringWithHyphens += stringWithoutHyphens.substr(8, 4);
    stringWithHyphens += "-";
    stringWithHyphens += stringWithoutHyphens.substr(12, 4);
    stringWithHyphens += "-";
    stringWithHyphens += stringWithoutHyphens.substr(16, 4);
    stringWithHyphens += "-";
    stringWithHyphens += stringWithoutHyphens.substr(20, 12);
    return stringWithHyphens;
}
} // namespace xrit_unreal