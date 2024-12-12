#include "reflect/serialize.h"

namespace xrit_unreal
{
// monostate (for std::variant)
void serialize(std::monostate &, std::stringstream &out)
{
    out << "{}";
}

// bool
void serialize(bool &value, std::stringstream &out)
{
    out << (value ? "true" : "false");
}

// float
void serialize(float &value, std::stringstream &out)
{
    out << value;
}

// int64_t
void serialize(int64_t &value, std::stringstream &out)
{
    out << value;
}

// uint64_t
void serialize(uint64_t &value, std::stringstream &out)
{
    out << value;
}

// std::string_view
void serialize(std::string_view &value, std::stringstream &out)
{
    out << "\"" << value << "\"";
}

// guid
void serialize(Guid &value, std::stringstream &out)
{
    out << "\"" << serializeGuid(value) << "\"";
}
} // namespace xrit_unreal