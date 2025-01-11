#ifndef XRIT_UNREAL_PARSE_H
#define XRIT_UNREAL_PARSE_H

#include "../data/parse_error.h"
#include "../guid.h"
#include "../utility.h"
#include "reflect.h"

#include <simdjson.h>

#include <charconv>

namespace xrit_unreal
{
[[nodiscard]] ParseErrorCode convert(simdjson::error_code code);

// creates a parse error from a simdjson error
template <typename T>
[[nodiscard]] ParseError createError(simdjson::error_code code, simdjson::ondemand::value value,
                                     std::string_view containingObjectName)
{
    if (code == simdjson::INCORRECT_TYPE)
    {
        std::ostringstream message;
        message << "Expected field to be of type " << typeName<T>();
        return ParseError{ParseErrorCode::InvalidValue, containingObjectName, value.raw_json_token(), message.str()};
    }
    else
    {
        return ParseError{convert(code), containingObjectName, value.raw_json_token(), simdjson::error_message(code)};
    }
}

// parse function signature:
// std::vector<ParseError> parse(simdjson::ondemand::value, T& out, std::string_view containingObjectName);

// parse default (disabled)
template <typename T>
[[nodiscard]] std::enable_if_t<IsDefault<T>::value, std::vector<ParseError>> parse(simdjson::ondemand::value, T &,
                                                                                   std::string_view)
{
    // static_assert(!sizeof(T)) makes sure the failure only happens when the template is instantiated, rather than
    // always
    static_assert(!sizeof(T), "parse() not implemented for type");
}

// built-in types
namespace internal
{
template <typename T>
std::vector<ParseError> parse(simdjson::ondemand::value value, T &out, std::string_view containingObjectName)
{
    std::vector<ParseError> errors;
    auto error = value.get(out);
    if (error)
    {
        errors.emplace_back(createError<T>(error, value, containingObjectName));
    }
    return errors;
}
} // namespace internal

// parse bool
[[nodiscard]] inline std::vector<ParseError> parse(simdjson::ondemand::value value, bool &out,
                                                   std::string_view containingObjectName)
{
    return internal::parse(value, out, containingObjectName);
}

// parse float
[[nodiscard]] inline std::vector<ParseError> parse(simdjson::ondemand::value value, float &out,
                                                   std::string_view containingObjectName)
{
    double temporaryOut;
    std::vector<ParseError> errors = internal::parse(value, temporaryOut, containingObjectName);
    if (errors.empty())
    {
        out = static_cast<float>(temporaryOut);
    }
    return errors;
}

// parse int64_t
[[nodiscard]] inline std::vector<ParseError> parse(simdjson::ondemand::value value, int64_t &out,
                                                   std::string_view containingObjectName)
{
    return internal::parse(value, out, containingObjectName);
}

// parse uint64_t
[[nodiscard]] inline std::vector<ParseError> parse(simdjson::ondemand::value value, uint64_t &out,
                                                   std::string_view containingObjectName)
{
    return internal::parse(value, out, containingObjectName);
}

// parse std::string_view / parse string_view / parse string view
[[nodiscard]] inline std::vector<ParseError> parse(simdjson::ondemand::value value, std::string_view &out,
                                                   std::string_view containingObjectName)
{
    return internal::parse(value, out, containingObjectName);
}

// parse guid
[[nodiscard]] inline std::vector<ParseError> parse(simdjson::ondemand::value value, Guid &out,
                                                   std::string_view containingObjectName)
{
    std::string_view string;
    std::vector<ParseError> errors = internal::parse(value, string, containingObjectName);
    if (errors.empty())
    {
        errors = parseGuid(string, out, containingObjectName);
    }
    return errors;
}

// parse unordered_map / dictionary keys (because keys are of type simdjson::ondemand::raw_json_string rather than
// simdjson::ondemand::value)

// default implementation:
template <typename T>
[[nodiscard]] std::vector<ParseError> parseStringView(std::string_view value, T &out,
                                                      std::string_view containingObjectName)
{
    auto [ptr, errorCode] = std::from_chars(value.begin(), value.end(), out);
    if (errorCode != std::errc() || ptr != value.end())
    {
        return {ParseError{ParseErrorCode::InvalidValue, containingObjectName, value}};
    }
    return {};
}

// string view doesn't need to be converted
template <>
[[nodiscard]] inline std::vector<ParseError> parseStringView(std::string_view value, std::string_view &out,
                                                             std::string_view containingObjectName)
{
    out = value;
    return {};
}

// Guid requires special handling (default implementation not used)
template <>
[[nodiscard]] inline std::vector<ParseError> parseStringView(std::string_view value, Guid &out,
                                                             std::string_view containingObjectName)
{
    return parseGuid(value, out, containingObjectName);
}

// parse enum
template <typename T>
[[nodiscard]] std::enable_if_t<std::is_enum_v<T>, std::vector<ParseError>> parse(simdjson::ondemand::value value,
                                                                                 T &out,
                                                                                 std::string_view containingObjectName)
{
    std::string_view string;
    simdjson::error_code simdjsonError = value.get(string);
    if (simdjsonError)
    {
        return {createError<T>(simdjsonError, value, containingObjectName)};
    }
    T enum_ = parseEnum<T>(string);
    if (enum_ == T::Invalid)
    {
        return {ParseError{ParseErrorCode::InvalidValue, containingObjectName, value.raw_json_token(),
                           "invalid enum case"}};
    }
    out = enum_;
    return {};
}

// parse vector
template <typename T>
[[nodiscard]] std::enable_if_t<IsVector<T>::value, std::vector<ParseError>> parse(simdjson::ondemand::value value,
                                                                                  T &out,
                                                                                  std::string_view containingObjectName)
{
    simdjson::ondemand::array array;
    simdjson::error_code simdjsonError = value.get(array);
    if (simdjsonError)
    {
        return {createError<T>(simdjsonError, value, containingObjectName)};
    }

    size_t arraySize;
    simdjsonError = array.count_elements().get(arraySize);
    if (simdjsonError)
    {
        return {createError<T>(simdjsonError, value, containingObjectName)};
    }

    std::vector<ParseError> errors;
    T temporaryOut(arraySize);
    size_t i = 0;
    for (auto entry : array)
    {
        std::ostringstream entryName;
        entryName << containingObjectName << "[" << i << "]";
        std::vector<ParseError> entryErrors = parse(entry.value(), temporaryOut[i], entryName.str());
        append(errors, entryErrors);
        i++;
    }
    out = std::move(temporaryOut);
    return errors;
}

// parse unordered map
template <typename T>
[[nodiscard]] std::enable_if_t<IsUnorderedMap<T>::value, std::vector<ParseError>> parse(
    simdjson::ondemand::value value, T &out, std::string_view containingObjectName)
{
    using KeyType = typename T::key_type;
    using MappedType = typename T::mapped_type;

    simdjson::ondemand::object o;
    simdjson::error_code simdjsonError = value.get(o);
    if (simdjsonError)
    {
        return {createError<T>(simdjsonError, value, containingObjectName)};
    }

    T temporaryOut{};
    std::vector<ParseError> errors;
    // iterate over all fields in map / dictionary
    for (auto field : o)
    {
        std::string_view keyString;
        simdjsonError = field.escaped_key().get(keyString);
        if (simdjsonError)
        {
            errors.emplace_back(createError<T>(simdjsonError, value, containingObjectName));
            continue;
        }

        KeyType key;
        std::vector<ParseError> keyErrors = parseStringView(keyString, key, containingObjectName);
        if (!keyErrors.empty())
        {
            append(errors, keyErrors);
            continue;
        }

        MappedType entryValue{};
        std::vector<ParseError> valueErrors = parse(field.value(), entryValue, keyString);
        if (!valueErrors.empty())
        {
            append(errors, valueErrors);
            continue;
        }
        temporaryOut.emplace(key, entryValue);
    }
    out = std::move(temporaryOut);
    return errors;
}

// forward declaration of parse remaining class fields (used by parse variant and parse class)
template <typename T>
[[nodiscard]] std::vector<ParseError> parseRemainingClassFields(simdjson::ondemand::object object,
                                                                simdjson::ondemand::object_iterator iterator, T &out,
                                                                std::string_view containingObjectName);

// parse variant
template <typename T>
[[nodiscard]] std::enable_if_t<IsVariant<T>::value, std::vector<ParseError>> parse(
    simdjson::ondemand::value value, T &out, std::string_view containingObjectName)
{
    simdjson::ondemand::object o;
    simdjson::error_code simdjsonError = value.get(o);
    if (simdjsonError)
    {
        return {createError<T>(simdjsonError, value, containingObjectName)};
    }

    auto result = o.is_empty();
    if (result.error())
    {
        return {createError<T>(result.error(), value, containingObjectName)};
    }
    if (result.value()) // if is empty
    {
        out = std::monostate{};
        return {}; // this is not an error, so we return an empty errors vector
    }

    auto begin = o.begin();
    if (begin.error())
    {
        return {createError<T>(begin.error(), value, containingObjectName)};
    }
    auto iterator = begin.value();

    auto typeField = *iterator;
    if (typeField.error())
    {
        return {createError<T>(typeField.error(), value, containingObjectName)};
    }

    std::string_view keyName;
    simdjsonError = typeField.escaped_key().get(keyName);
    if (simdjsonError)
    {
        return {createError<T>(simdjsonError, value, containingObjectName)};
    }

    if (keyName != "$type")
    {
        return {ParseError{ParseErrorCode::VariantTypeMissing, containingObjectName, value.raw_json_token(),
                           "Variant should start with field $type"}};
    }

    std::string_view type;
    simdjsonError = typeField.value().get(type);
    if (simdjsonError)
    {
        return {createError<T>(simdjsonError, value, containingObjectName)};
    }
    ++iterator;

    std::vector<ParseError> errors;
    bool found = false;
    auto tryParse = [&]<std::size_t Index>() {
        if (found)
        {
            return;
        } // if we found the type already, don't do anything
        using Type = std::variant_alternative_t<Index + 1, T>;
        std::string_view variantName = classInfo<Type>().name;
        if (variantName == type)
        {
            out = Type{};
            auto &a = std::get<Type>(out);
            errors = parseRemainingClassFields(o, iterator, a, containingObjectName);
            found = true;
        }
    };
    auto iterateIndices = [&]<std::size_t... Indices>(std::index_sequence<Indices...>) {
        (tryParse.template operator()<Indices>(), ...);
    };
    constexpr size_t size = std::variant_size_v<T>;
    iterateIndices(std::make_index_sequence<size - 1>{}); // only iterate over after monostate
    if (!found)
    {
        return {ParseError{ParseErrorCode::VariantTypeInvalid, containingObjectName, value.raw_json_token(),
                           "Variant does not contain provided type"}};
    }
    return errors;
}

// parse class
template <typename T>
[[nodiscard]] std::enable_if_t<IsClass<T>::value, std::vector<ParseError>> parse(simdjson::ondemand::value value,
                                                                                 T &out,
                                                                                 std::string_view containingObjectName)
{
    simdjson::ondemand::object o;
    simdjson::error_code simdjsonError = value.get(o);
    if (simdjsonError)
    {
        return {createError<T>(simdjsonError, value, containingObjectName)};
    }
    return parseRemainingClassFields(o, o.begin(), out, containingObjectName);
}

// parse remaining class fields implementation
template <typename T>
[[nodiscard]] std::vector<ParseError> parseRemainingClassFields(simdjson::ondemand::object object,
                                                                simdjson::ondemand::object_iterator iterator, T &out,
                                                                std::string_view containingObjectName)
{
    std::vector<ParseError> errors;
    T temporaryOut{};

    while (iterator != object.end())
    {
        auto field = *iterator;

        std::string_view keyString;
        auto simdjsonError = field.escaped_key().get(keyString);
        if (simdjsonError)
        {
            errors.emplace_back(ParseError{convert(simdjsonError), {}, {}, simdjson::error_message(simdjsonError)});
            ++iterator;
            continue;
        }
        bool found = false;
        // iterate over the fields of the reflected c++ struct and see if it contains the key of the current json object
        // field
        auto fields = classInfo<T>().fields;
        std::vector<ParseError> fieldErrors;
        auto a = [&](auto &&...args) {
            (([&]() {
                 if (found)
                 {
                     return;
                 } // if we found the field already, don't do anything
                 if (keyString == args.key)
                 {
                     found = true;
                     fieldErrors = parse(field.value(), temporaryOut.*args.value, keyString);
                 }
             }()),
             ...); // fold expression
        };
        std::apply(a, fields);
        if (!found)
        {
            errors.emplace_back(ParseError{ParseErrorCode::InvalidField, containingObjectName, keyString,
                                           "Object does not contain provided field name"});
        }
        append(errors, fieldErrors);
        ++iterator;
    }
    out = std::move(temporaryOut);
    return errors;
}
} // namespace xrit_unreal

#endif // XRIT_UNREAL_PARSE_H