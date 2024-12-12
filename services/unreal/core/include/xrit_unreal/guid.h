#ifndef XRIT_UNREAL_GUID_H
#define XRIT_UNREAL_GUID_H

#include "data/guid.h"
#include "data/parse_error.h"

namespace xrit_unreal
{
[[nodiscard]] bool operator==(Guid const &lhs, Guid const &rhs);

[[nodiscard]] bool operator!=(Guid const &lhs, Guid const &rhs);

// character is in range 0-9, A-F or a-f (uppercase and lowercase)
[[nodiscard]] bool isHexCharacter(char character);

// one hex character is 4 bits, 2 hex characters make one byte
[[nodiscard]] uint32_t parseHexCharacter(char character);

// parse 32-bit hex number (4 bytes, = 8 characters)
// string SHOULD be 8 characters long
[[nodiscard]] uint32_t parseHexNumber32Bits(std::string_view string);

// we only support guids that are encoded like this (16 bytes in hex):
// "ab47a721-e1ae-4c71-abab-a3c7075a98ee"
// letters can be uppercase or lowercase
[[nodiscard]] std::vector<ParseError> parseGuid(std::string_view string, Guid &outGuid, std::string_view fieldName);

[[nodiscard]] std::string serializeGuid(Guid const &guid);
} // namespace xrit_unreal

// to enable usage inside e.g. a std::unordered_set or std::unordered_map
template <> struct std::hash<xrit_unreal::Guid>
{
    size_t operator()(xrit_unreal::Guid const &guid) const noexcept
    {
        // Unreal uses city hash, might be better, but for now this suffices
        size_t seed = 0;
        size_t prime = 31;

        seed = seed * prime + std::hash<uint32_t>{}(guid.a);
        seed = seed * prime + std::hash<uint32_t>{}(guid.b);
        seed = seed * prime + std::hash<uint32_t>{}(guid.c);
        seed = seed * prime + std::hash<uint32_t>{}(guid.d);

        return seed;
    }
};

#endif // XRIT_UNREAL_GUID_H