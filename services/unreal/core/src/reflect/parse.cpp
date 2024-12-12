#include <reflect/parse.h>

namespace xrit_unreal
{
ParseErrorCode convert(simdjson::error_code code)
{
    switch (code)
    {
    case simdjson::TAPE_ERROR:
    case simdjson::MEMALLOC:
    case simdjson::UNINITIALIZED:
    case simdjson::OUT_OF_ORDER_ITERATION:
    case simdjson::IO_ERROR:
    case simdjson::NO_SUCH_FIELD:
    case simdjson::EMPTY:
    case simdjson::UNSUPPORTED_ARCHITECTURE:
    case simdjson::INDEX_OUT_OF_BOUNDS:
    case simdjson::INSUFFICIENT_PADDING:
    case simdjson::PARSER_IN_USE:
    case simdjson::UNEXPECTED_ERROR:
    case simdjson::OUT_OF_BOUNDS:
        return ParseErrorCode::InternalError;
    case simdjson::CAPACITY:
    case simdjson::DEPTH_ERROR:
    case simdjson::UTF8_ERROR:
    case simdjson::UNESCAPED_CHARS:
    case simdjson::UNCLOSED_STRING:
    case simdjson::INVALID_JSON_POINTER:
    case simdjson::INCOMPLETE_ARRAY_OR_OBJECT:
    case simdjson::TRAILING_CONTENT:
    case simdjson::INVALID_URI_FRAGMENT: // don't know what this is
    case simdjson::SCALAR_DOCUMENT_AS_VALUE:
        return ParseErrorCode::InvalidJson;
    case simdjson::STRING_ERROR:
    case simdjson::T_ATOM_ERROR:
    case simdjson::F_ATOM_ERROR:
    case simdjson::N_ATOM_ERROR:
    case simdjson::NUMBER_ERROR:
    case simdjson::BIGINT_ERROR:
    case simdjson::INCORRECT_TYPE:
    case simdjson::NUMBER_OUT_OF_RANGE:
        return ParseErrorCode::InvalidValue;
    default:
        assert(false);
    }
    assert(false);
    return ParseErrorCode::Invalid;
}
} // namespace xrit_unreal