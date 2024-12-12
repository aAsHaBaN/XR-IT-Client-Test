#ifndef XRIT_UNREAL_HASH_H
#define XRIT_UNREAL_HASH_H

// for hashing the settings.
// only include the fields that can't be set at runtime
#define HASH_STRUCT(TypeName)                                                                                          \
    template <> struct std::hash<TypeName>                                                                             \
    {                                                                                                                  \
        size_t operator()(TypeName const &value) const noexcept                                                        \
        {                                                                                                              \
            size_t seed = 0;                                                                                           \
            size_t prime = 31;

#define HASH_FIELD(TypeName, FieldName) seed = seed * prime + std::hash<TypeName>{}(value.FieldName);

#define HASH_STRUCT_END                                                                                                \
    return seed;                                                                                                       \
    }                                                                                                                  \
    }                                                                                                                  \
    ;

#endif // XRIT_UNREAL_HASH_H