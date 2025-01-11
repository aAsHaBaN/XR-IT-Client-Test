#include <gtest/gtest.h>

#include <xrit_unreal/data/configuration.h>
#include <xrit_unreal/generate_mock_data.h>
#include <xrit_unreal/parse_json.h>
#include <xrit_unreal/reflect/parse.h>

using namespace xrit_unreal;

namespace xrit_unreal::configuration_tests
{
    TEST(Configuration, ParseConfiguration)
    {
        std::string mockConfiguration = generateMockConfiguration();
        JsonDocument document;
        ASSERT_EQ(parseJson(mockConfiguration, document), simdjson::SUCCESS);

        // parse configuration
        Configuration configuration;
        std::vector<ParseError> errors = parse(document.document.get_value().value(), configuration, "");
        ASSERT_TRUE(errors.empty());
    }
}