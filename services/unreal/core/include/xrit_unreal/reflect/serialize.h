#ifndef XRIT_UNREAL_SERIALIZE_H
#define XRIT_UNREAL_SERIALIZE_H

#include "../guid.h"
#include "reflect.h"

#include <sstream>

namespace xrit_unreal
{
// built-in types (declarations only)

// monostate (for std::variant)
void serialize(std::monostate &, std::stringstream &out);

// bool
void serialize(bool &value, std::stringstream &out);

// float
void serialize(float &value, std::stringstream &out);

// int64_t
void serialize(int64_t &value, std::stringstream &out);

// uint64_t
void serialize(uint64_t &value, std::stringstream &out);

// std::string_view
void serialize(std::string_view &value, std::stringstream &out);

// guid
void serialize(Guid &value, std::stringstream &out);

// serialize default (disabled)
template <typename T> std::enable_if_t<IsDefault<T>::value, void> serialize(T &, std::stringstream &)
{
    // static_assert(!sizeof(T)) makes sure the failure only happens when the template is instantiated, rather than
    // always
    static_assert(!sizeof(T), "serialize() not implemented for type");
}

// serialize enum
template <typename T> std::enable_if_t<std::is_enum_v<T>, void> serialize(T &value, std::stringstream &out)
{
    out << "\"" << serializeEnum(value) << "\"";
}

// serialize vector
template <typename T> std::enable_if_t<IsVector<T>::value, void> serialize(T &value, std::stringstream &out)
{
    out << "[";
    // iterate over all entries in the vector
    for (size_t i = 0; i < value.size(); i++)
    {
        serialize(value[i], out);
        if (i < value.size() - 1)
        {
            out << ",";
        }
    }
    out << "]";
}

// serialize unordered map
template <typename T> std::enable_if_t<IsUnorderedMap<T>::value, void> serialize(T &value, std::stringstream &out)
{
    using KeyType = typename T::key_type;
    using MappedType = typename T::mapped_type;

    out << "{";
    for (std::pair<KeyType const, MappedType> &entry : value)
    {
        KeyType key = entry.first;
        MappedType &entryValue = entry.second;

        // key should always be converted to a string
        out << "\"";
        serialize(key, out);
        out << "\":";
        serialize(entryValue, out);
        out << ",";
    }
    if (!value.empty())
    {
        out.seekp(-1, std::stringstream::cur); // move back one place to get rid of the trailing comma
    }
    out << "}";
}

// forward declarations for serialize class
template <typename T> void serializeClassFields(T &value, std::stringstream &out);

// serialize variant
template <typename T> std::enable_if_t<IsVariant<T>::value, void> serialize(T &value, std::stringstream &out)
{
    if (std::holds_alternative<std::monostate>(value))
    {
        out << "{}";
        return;
    }

    auto trySerialize = [&]<std::size_t Index>() {
        using Type = std::variant_alternative_t<Index + 1, T>;
        if (std::holds_alternative<Type>(value))
        {
            auto struct_ = classInfo<Type>();
            out << R"({"$type":")" << struct_.name << "\"";
            if constexpr (std::tuple_size_v<decltype(struct_.fields)> > 0)
            {
                out << ",";
                serializeClassFields(std::get<Type>(value), out);
            }
            out << "}";
        }
    };

    auto iterateIndices = [&]<std::size_t... Indices>(std::index_sequence<Indices...>) {
        (trySerialize.template operator()<Indices>(), ...);
    };
    constexpr size_t size = std::variant_size_v<T>;
    iterateIndices(std::make_index_sequence<size - 1>{});
}

// serialize class
template <typename T> std::enable_if_t<IsClass<T>::value, void> serialize(T &value, std::stringstream &out)
{
    out << "{";
    serializeClassFields(value, out);
    out << "}";
}

// serialize class fields implementation
template <typename T> void serializeClassFields(T &value, std::stringstream &out)
{
    // iterate over all reflected fields in struct
    int count = 0;
    auto a = [&](auto &&...args) {
        (([&]() {
             out << "\"" << args.key << "\":";
             serialize(value.*args.value, out);
             out << ",";
             count++;
         }()),
         ...);
    };
    std::apply(a, classInfo<T>().fields);
    if (count > 0)
    {
        out.seekp(-1, std::stringstream::cur); // move back one place to get rid of the trailing comma
    }
}
} // namespace xrit_unreal

#endif // XRIT_UNREAL_SERIALIZE_H