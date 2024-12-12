//
// Created by Arjo Nagelhout on 01/11/2024.
//

#ifndef XRIT_UNREAL_DATA_GUID_H
#define XRIT_UNREAL_DATA_GUID_H
#include <cstdint>

namespace xrit_unreal
{
// same struct layout as Unreal Engine
struct Guid
{
    uint32_t a;
    uint32_t b;
    uint32_t c;
    uint32_t d;
};
} // namespace xrit_unreal

#endif // XRIT_UNREAL_DATA_GUID_H