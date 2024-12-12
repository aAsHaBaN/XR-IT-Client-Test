#include <gtest/gtest.h>

#define SIMDJSON_DEVELOPMENT_CHECKS 1

#include <simdjson.h>

#include <xrit_unreal/parse_json.h>
#include <xrit_unreal/guid.h>
#include <xrit_unreal/reflect/parse.h>

namespace xrit_unreal::guid_tests
{
    TEST(Guid, IsHexCharacter)
    {
        std::string validCharacters = "abcdefABCDEF0123456789";
        std::string invalidCharacters = R"(ghijklmnopqrstuvwxyzGHIJKLMNOPQRSTUVWXYZ!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~)";
        for (char validCharacter: validCharacters)
        {
            ASSERT_TRUE(isHexCharacter(validCharacter));
        }
        for (char invalidCharacter: invalidCharacters)
        {
            ASSERT_FALSE(isHexCharacter(invalidCharacter));
        }
    }

    TEST(Guid, ParseHexCharacter)
    {
        std::vector<std::pair<char, uint8_t>> cases{
            {'0', 0},
            {'1', 1},
            {'2', 2},
            {'3', 3},
            {'4', 4},
            {'5', 5},
            {'6', 6},
            {'7', 7},
            {'8', 8},
            {'9', 9},

            // lowercase
            {'a', 10},
            {'b', 11},
            {'c', 12},
            {'d', 13},
            {'e', 14},
            {'f', 15},

            // uppercase
            {'A', 10},
            {'B', 11},
            {'C', 12},
            {'D', 13},
            {'E', 14},
            {'F', 15},
        };

        for (auto case_: cases)
        {
            ASSERT_EQ(parseHexCharacter(case_.first), case_.second);
        }
    }

    TEST(Guid, ParseHexNumber32Bits)
    {
        std::vector<std::pair<std::string_view, uint32_t>> cases{
            {"f0d48a23", 0b11110000110101001000101000100011},
            {"ffffffff", 0b11111111111111111111111111111111},
            {"00000000", 0b00000000000000000000000000000000},
            {"0000ffff", 0b00000000000000001111111111111111},
            {"789103aa", 0b01111000100100010000001110101010},
        };

        for (auto case_: cases)
        {
            ASSERT_EQ(parseHexNumber32Bits(case_.first), case_.second);
        }
    }

    TEST(Guid, ParseGuid)
    {
        std::vector<std::pair<std::string_view, Guid>> validCases{
            {"dea0720b-db67-4188-8aed-020709dff6ef", {3735056907, 3680977288, 2330788359, 165672687}},
            {"7FD45F44-F4BE-4B62-969A-8D6EDB85711D", {2144624452, 4106111842, 2526711150, 3682955549}}
        };

        for (auto case_: validCases)
        {
            Guid result{};
            ASSERT_TRUE(parseGuid(case_.first, result, "").empty());
            ASSERT_EQ(result, case_.second);
        }

        // invalid cases
        std::vector<std::string_view> invalidCases{
            "7FD45F44-F4BE4B62-969A8D6E-DB85711D", // hyphens in the wrong place
            "26ce766b8f164cf99624b15aee986d89", // no hyphens
            "{3d5be72dcd6a4b0b9385b40a9b44bc9c}", // braces
            "POkkqNbyek2PL3oImR9s7g==" // base64 encoded
        };
        for (auto case_: invalidCases)
        {
            Guid result{};
            ASSERT_FALSE(parseGuid(case_, result, "").empty());
            Guid g = Guid{0, 0, 0, 0};
            ASSERT_EQ(result, g);
        }
    }

    TEST(Guid, JsonGetGuid)
    {
        std::string_view json = R"({"value 1": "dea0720b-db67-4188-8aed-020709dff6ef", "value 2": "7FD45F44-F4BE-4B62-969A-8D6EDB85711D"})";
        JsonDocument document;
        ASSERT_EQ(parseJson(json, document), simdjson::SUCCESS);
        simdjson::ondemand::object object;
        ASSERT_EQ(document.document.get(object), simdjson::error_code::SUCCESS);

        Guid expected1{3735056907, 3680977288, 2330788359, 165672687};
        Guid value1{};

        ASSERT_TRUE(parse(object["value 1"], value1, "value 1").empty());
        ASSERT_EQ(value1, expected1);

        Guid expected2{2144624452, 4106111842, 2526711150, 3682955549};
        Guid value2{};
        ASSERT_TRUE(parse(object["value 2"], value2, "value 2").empty());
        ASSERT_EQ(value2, expected2);
    }

    TEST(Guid, SerializeGuid)
    {
        Guid value{3735056907, 3680977288, 2330788359, 165672687};
        std::string_view expected = "dea0720b-db67-4188-8aed-020709dff6ef";

        std::string result = serializeGuid(value);

        ASSERT_EQ(result, expected);
    }
}