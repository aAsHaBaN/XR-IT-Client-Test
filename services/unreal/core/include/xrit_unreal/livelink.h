#ifndef XRIT_UNREAL_LIVELINK_H
#define XRIT_UNREAL_LIVELINK_H

#include "data/configuration.h"
#include "data/livelink.h"
#include "guid.h"

#include <functional>

namespace xrit_unreal
{
struct LiveLinkSourceCacheEntry
{
    Guid unrealGuid; // the Guid of the source internally used by Unreal Engine
    size_t settingsHash;
    // hash for settings that *can't* be updated after a source has been created (so "base" is excluded)
    LiveLinkSourceVariants value;
};

struct LiveLinkSourceCache
{
    // key = node guid, the Guid of the source used by the Xrit Node
    std::unordered_map<Guid, LiveLinkSourceCacheEntry> entries;
};

struct LiveLinkCallbacks
{
    std::function<std::vector<LiveLinkError>(Guid)> removeSource;
    std::function<std::vector<LiveLinkError>(LiveLinkSourceVariants const &source, Guid &outUnrealId)> createSource;
    // create source and return the unrealId of the newly created source
    std::function<std::vector<LiveLinkError>(LiveLinkSourceVariants const &source, Guid unrealId)> updateSource;
    // update source with the given unrealId
};

// if `setLiveLinkSources` symbol is not defined: check whether all `std::hash` template specializations are there for
// all source types.
[[nodiscard]] std::vector<LiveLinkError> setLiveLinkSources(LiveLinkSourceCache &cache,
                                                            std::vector<LiveLinkSourceVariants> const &desiredSources,
                                                            LiveLinkCallbacks const &callbacks) noexcept;
} // namespace xrit_unreal

#endif // XRIT_UNREAL_LIVELINK_H