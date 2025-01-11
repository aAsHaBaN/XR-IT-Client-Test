#include <gtest/gtest.h>

#include <xrit_unreal/reflect/reflect.h>
#include <xrit_unreal/reflect/parse.h>
#include <xrit_unreal/reflect/serialize.h>
#include <xrit_unreal/parse_json.h>

namespace xrit_unreal::reflection_tests
{
    // enum
    enum class ReflectionEnumTest
    {
        Invalid,
        Case1,
        Case2,
        Case3,
        Case4,
        Case5,
        Count
    };
}

REFLECT_IMPL_ENUM_BEGIN(xrit_unreal::reflection_tests::ReflectionEnumTest)
            REFLECT_IMPL_CASE(Case1)
            REFLECT_IMPL_CASE(Case2)
            REFLECT_IMPL_CASE(Case3)
            REFLECT_IMPL_CASE(Case4)
            REFLECT_IMPL_CASE(Case5)
REFLECT_IMPL_ENUM_END

namespace xrit_unreal::reflection_tests
{
    TEST(Reflection, EnumParse)
    {
        JsonDocument d;
        ASSERT_EQ(parseJson(R"({"e": "Invalid", "e2": "Case4"})", d), simdjson::SUCCESS);
        ReflectionEnumTest value;
        ASSERT_FALSE(parse(d.document["e"], value, "e").empty());
        ASSERT_TRUE(parse(d.document["e2"], value, "e2").empty());
        ASSERT_EQ(value, ReflectionEnumTest::Case4);
    }

    TEST(Reflection, EnumSerialize)
    {
        std::stringstream out;
        ReflectionEnumTest value = ReflectionEnumTest::Case5;
        serialize(value, out);
        ASSERT_EQ(out.str(), "\"Case5\"");
    }

    // vector

    TEST(Reflection, VectorParse)
    {
        JsonDocument d;
        ASSERT_EQ(parseJson(R"({"values": [0, 1, 0, 2, -43, 5, 6, 87]})", d), simdjson::SUCCESS);
        std::vector<int64_t> values;
        ASSERT_TRUE(parse(d.document["values"], values, "values").empty());
        std::vector<int64_t> expected{0, 1, 0, 2, -43, 5, 6, 87};
        ASSERT_EQ(values, expected);
    }

    TEST(Reflection, VectorSerialize)
    {
        std::stringstream out;
        std::vector<uint64_t> values{0, 1, 2, 3, 10, 12};
        serialize(values, out);
        ASSERT_EQ(out.str(), "[0,1,2,3,10,12]");
    }

    // unordered map

    TEST(Reflection, UnorderedMapParse)
    {
        JsonDocument d;
        ASSERT_EQ(parseJson(R"({"map": {
    "a": 1,
    "b": 3,
    "some": 10,
    "other": 230
}})", d), simdjson::SUCCESS);
        std::unordered_map<std::string_view, int64_t> values;
        ASSERT_TRUE(parse(d.document["map"], values, "map").empty());
        std::unordered_map<std::string_view, int64_t> expected{
            { "a", 1},
            {"b", 3},
            {"some", 10},
            {"other", 230}
        };
        ASSERT_EQ(values, expected);
    }

    TEST(Reflection, UnorderedMapSerialize)
    {
        std::stringstream out;
        std::vector<uint64_t> values{0, 1, 2, 3, 10, 12};
        serialize(values, out);
        ASSERT_EQ(out.str(), "[0,1,2,3,10,12]");
    }

    struct One
    {
        bool one;
    };

    struct Two
    {
        int64_t two;
    };

    struct Three
    {
        float three;
    };
}

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::reflection_tests::One)
                    REFLECT_IMPL_FIELD(one)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::reflection_tests::Two)
                    REFLECT_IMPL_FIELD(two)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::reflection_tests::Three)
                    REFLECT_IMPL_FIELD(three)
REFLECT_IMPL_STRUCT_END

namespace xrit_unreal::reflection_tests
{
    // variant

    TEST(Reflection, VariantParse)
    {
        JsonDocument d;
        ASSERT_EQ(parseJson(R"({
    "one": {
        "$type": "xrit_unreal::reflection_tests::One",
        "one": true
    },
    "two": {
        "$type": "xrit_unreal::reflection_tests::Two",
        "two": 323
    },
    "three": {
        "$type": "xrit_unreal::reflection_tests::Three",
        "three": 2.5
    },
    "invalid": {
        "$type": "SomeUnknownTypeName",
        "something": 10
    },
    "invalid2": {
        "something": 232
    },
    "empty": {}
})", d), simdjson::SUCCESS);
        std::variant<std::monostate, One, Two, Three> variants;

        ASSERT_TRUE(parse(d.document["one"], variants, "one").empty());
        ASSERT_TRUE(std::holds_alternative<One>(variants));
        ASSERT_EQ(std::get<One>(variants).one, true);

        ASSERT_TRUE(parse(d.document["two"], variants, "two").empty());
        ASSERT_TRUE(std::holds_alternative<Two>(variants));
        ASSERT_EQ(std::get<Two>(variants).two, 323);

        ASSERT_TRUE(parse(d.document["three"], variants, "three").empty());
        ASSERT_TRUE(std::holds_alternative<Three>(variants));
        ASSERT_EQ(std::get<Three>(variants).three, 2.5f);

        std::vector<ParseError> invalidErrors = parse(d.document["invalid"], variants, "invalid");
        ASSERT_FALSE(invalidErrors.empty());
        std::vector<ParseError> invalid2Errors = parse(d.document["invalid2"], variants, "invalid2");
        ASSERT_FALSE(invalid2Errors.empty());

        ASSERT_TRUE(parse(d.document["empty"], variants, "empty").empty());
        ASSERT_TRUE(std::holds_alternative<std::monostate>(variants));
    }

    TEST(Reflection, VariantSerialize)
    {
        std::stringstream out;
        std::variant<std::monostate, One, Two, Three> variants = std::monostate{};

        serialize(variants, out);
        ASSERT_EQ(out.str(), "{}");

        std::stringstream out2;
        variants = One{.one = true};
        serialize(variants, out2);
        ASSERT_EQ(out2.str(), R"({"$type":"xrit_unreal::reflection_tests::One","one":true})");

        std::stringstream out3;
        variants = Two{.two = 1235};
        serialize(variants, out3);
        ASSERT_EQ(out3.str(), R"({"$type":"xrit_unreal::reflection_tests::Two","two":1235})");
    }

    struct FurtherNestedClass
    {
        bool some;
        float value;

        bool operator==(FurtherNestedClass const& other) const
        {
            return some == other.some && value == other.value;
        }
    };

    struct NestedClass
    {
        FurtherNestedClass a;
        bool b;

        bool operator==(NestedClass const& other) const
        {
            return a == other.a && b == other.b;
        }
    };

    struct Class
    {
        NestedClass value1;
        NestedClass value2;

        bool operator==(Class const& other) const
        {
            return value1 == other.value1 && value2 == other.value2;
        }
    };
}


REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::reflection_tests::FurtherNestedClass)
                    REFLECT_IMPL_FIELD(some)
                    REFLECT_IMPL_FIELD(value)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::reflection_tests::NestedClass)
                    REFLECT_IMPL_FIELD(a)
                    REFLECT_IMPL_FIELD(b)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::reflection_tests::Class)
                    REFLECT_IMPL_FIELD(value1)
                    REFLECT_IMPL_FIELD(value2)
REFLECT_IMPL_STRUCT_END

namespace xrit_unreal::reflection_tests
{
    // class

    TEST(Reflection, ClassParse)
    {
        JsonDocument d;
        ASSERT_EQ(parseJson(R"({
    "validClass": {
        "value1": {
            "a": {
                "some": true,
                "value": 1.4
            },
            "b": true
        },
        "value2": {
            "a": {
                "some": false,
                "value": 4.4
            },
            "b": false
        }
    },
    "invalidClass": {
        "unknownValue": 123
    }
})", d), simdjson::SUCCESS);
        Class value{};

        ASSERT_TRUE(parse(d.document["validClass"], value, "validClass").empty());
        Class expected{
            .value1{
                .a{
                    .some = true,
                    .value = 1.4f
                },
                .b = true
            },
            .value2{
                .a{
                    .some = false,
                    .value = 4.4f
                },
                .b = false
            }
        };
        ASSERT_EQ(value, expected);
        std::vector<ParseError> invalidClassErrors = parse(d.document["invalidClass"], value, "invalidClass");
        ASSERT_FALSE(invalidClassErrors.empty());
    }

    TEST(Reflection, ClassSerialize)
    {
        std::stringstream out;
        Class value{
            .value1{
                .a{
                    .some = false,
                    .value = 1234.5f
                },
                .b = true
            },
            .value2{
                .a{
                    .some = true,
                    .value = 0.f
                },
                .b = false
            }
        };
        serialize(value, out);
        ASSERT_EQ(out.str(), R"({"value1":{"a":{"some":false,"value":1234.5},"b":true},"value2":{"a":{"some":true,"value":0},"b":false}})");
    }

    TEST(Reflection, Name)
    {
        std::string_view namespacePrefix = "xrit_unreal::reflection_tests::";

        // class
        std::string_view a = typeName<Class>();
        std::ostringstream aExpected;
        aExpected << "class " << namespacePrefix << "Class";
        ASSERT_EQ(a, aExpected.str());

        // variant
        std::string_view b = typeName<std::variant<std::monostate, One, Two, Three>>();
        std::ostringstream bExpected;
        bExpected << "variant<" << namespacePrefix << "One, " << namespacePrefix << "Two, " << namespacePrefix << "Three>";
        ASSERT_EQ(b, bExpected.str());

        // enum
        std::string_view c = typeName<ReflectionEnumTest>();
        std::ostringstream cExpected;
        cExpected << "enum " << namespacePrefix << "ReflectionEnumTest";
        ASSERT_EQ(c, cExpected.str());

        // dictionary
        std::string_view d = typeName<std::unordered_map<uint64_t, Class>>();
        std::ostringstream dExpected;
        dExpected << "dictionary<uint64, " << aExpected.str() << ">";
        ASSERT_EQ(d, dExpected.str());

        // list
        std::string_view e = typeName<std::vector<ReflectionEnumTest>>();
        std::ostringstream eExpected;
        eExpected << "list<" << cExpected.str() << ">";
        ASSERT_EQ(e, eExpected.str());
    }
}