#include <gtest/gtest.h>

#include <xrit_unreal/parse_json.h>

namespace xrit_unreal::parse_json_tests
{
    TEST(ParseJson, JsonParseDocument)
    {
        std::string_view json = R"({"a piece of data": 123, "another value": "this is a string"})";
        JsonDocument document;
        ASSERT_EQ(parseJson(json, document), simdjson::SUCCESS);
        simdjson::ondemand::object object;
        ASSERT_EQ(document.document.get(object), simdjson::error_code::SUCCESS);

        uint64_t value;
        simdjson::error_code error = object["a piece of data"].get(value);
        ASSERT_EQ(error, simdjson::error_code::SUCCESS);
        ASSERT_EQ(value, 123);

        std::string_view str;
        error = object["another value"].get(str);
        ASSERT_EQ(error, simdjson::error_code::SUCCESS);
        ASSERT_EQ(str, "this is a string");
    }
}