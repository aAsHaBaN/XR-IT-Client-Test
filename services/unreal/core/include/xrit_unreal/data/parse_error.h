#ifndef XRIT_UNREAL_PARSE_ERROR_H
#define XRIT_UNREAL_PARSE_ERROR_H

#include "../reflect/reflect.h"

namespace xrit_unreal
{
REFLECT_ENUM

enum class ParseErrorCode
{
    Invalid,            // to indicate that enum parsing failed, not a valid error code
    InternalError,      // internal error, if this gets sent back to the Node, the plugin should be fixed
    InvalidJson,        // json is ill-formed
    InvalidValue,       // specific value is not correct
    InvalidField,       // field does not exist
    VariantTypeMissing, // variant does not contain $type field
    VariantTypeInvalid, // variant does not contain the provided type
    Count
};

REFLECT_STRUCT

struct ParseError
{
    ParseErrorCode REFLECT(code);                // for actual error handling
    std::string_view REFLECT(containing_object); // for identifying the object to which the error applies
    std::string_view REFLECT(value);             // for identifying the value to which the error applies
    std::string_view REFLECT(message);           // user facing message
};
} // namespace xrit_unreal

#include "parse_error_generated.h"

#endif // XRIT_UNREAL_PARSE_ERROR_H