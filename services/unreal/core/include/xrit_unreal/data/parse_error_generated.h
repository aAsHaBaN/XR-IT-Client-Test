// -----------------------------------------------------------
// automatically generated with scripts/generate_reflection.py
// don't edit this file directly.
// -----------------------------------------------------------

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::ParseError)
    REFLECT_IMPL_FIELD(code)
    REFLECT_IMPL_FIELD(containing_object)
    REFLECT_IMPL_FIELD(value)
    REFLECT_IMPL_FIELD(message)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_ENUM_BEGIN(xrit_unreal::ParseErrorCode)
    REFLECT_IMPL_CASE(InternalError)
    REFLECT_IMPL_CASE(InvalidJson)
    REFLECT_IMPL_CASE(InvalidValue)
    REFLECT_IMPL_CASE(InvalidField)
    REFLECT_IMPL_CASE(VariantTypeMissing)
    REFLECT_IMPL_CASE(VariantTypeInvalid)
REFLECT_IMPL_ENUM_END

