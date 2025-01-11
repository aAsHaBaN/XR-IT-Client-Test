#ifndef XRIT_UNREAL_UTILITY_H
#define XRIT_UNREAL_UTILITY_H

#include <vector>

namespace xrit_unreal
{
template <typename T> void append(std::vector<T> &to, std::vector<T> &values)
{
    to.reserve(to.size() + values.size());
    to.insert(to.end(), values.begin(), values.end());
}
} // namespace xrit_unreal

#endif // XRIT_UNREAL_UTILITY_H