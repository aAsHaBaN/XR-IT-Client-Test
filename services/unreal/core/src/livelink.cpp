#include "livelink.h"

#include <string>

#include "hash.h"
#include "utility.h"

// hash implementations (if any of the following fields change, we should recreate the source)
HASH_STRUCT(xrit_unreal::LiveLinkDummySourceSettings)
HASH_FIELD(std::string_view, ip_address)
HASH_FIELD(int64_t, port)
HASH_STRUCT_END

HASH_STRUCT(xrit_unreal::LiveLinkMvnSourceSettings)
HASH_FIELD(int64_t, port);
HASH_STRUCT_END

// todo:
HASH_STRUCT(xrit_unreal::LiveLinkXrSourceSettings)

HASH_STRUCT_END

HASH_STRUCT(xrit_unreal::VirtualSubjectSourceSettings)

HASH_STRUCT_END

HASH_STRUCT(xrit_unreal::LiveLinkFreeDSourceSettings)

HASH_STRUCT_END

HASH_STRUCT(xrit_unreal::LiveLinkMessageBusSourceSettings)

HASH_STRUCT_END

HASH_STRUCT(xrit_unreal::LiveLinkOptitrackSourceSettings)
HASH_FIELD(std::string_view, server_address);
HASH_FIELD(std::string_view, client_address);
HASH_STRUCT_END

namespace xrit_unreal
{
[[nodiscard]] Guid getNodeGuid(LiveLinkSourceVariants const &source)
{
    Guid outGuid{};
    bool foundId = false;
    std::visit(
        [&](auto &&arg) {
            using T = std::decay_t<decltype(arg)>;
            if constexpr (!std::is_same_v<T, std::monostate>)
            {
                outGuid = arg.id;
                foundId = true;
            }
        },
        source);
    assert(foundId);
    return outGuid;
}

std::vector<LiveLinkError> setLiveLinkSources(LiveLinkSourceCache &cache,
                                              std::vector<LiveLinkSourceVariants> const &desiredSources,
                                              LiveLinkCallbacks const &callbacks) noexcept
{
    std::vector<LiveLinkError> errors;

    if (desiredSources.empty())
    {
        // add all cached entries to which ones we should remove
        for (auto &entry : cache.entries)
        {
            std::vector<LiveLinkError> removeSourceErrors = callbacks.removeSource(entry.second.unrealGuid);
            append(errors, removeSourceErrors);
        }

        // clear cache
        cache.entries.clear();
        return errors;
    }

    // remove all sources in the cache entries that are not found in the desiredSources
    std::vector<Guid> nodeGuidsToRemove;
    for (auto &entry : cache.entries)
    {
        bool found = false;
        Guid cacheEntryNodeGuid = entry.first;
        for (auto &desiredSource : desiredSources)
        {
            Guid desiredSourceNodeGuid = getNodeGuid(desiredSource);
            if (cacheEntryNodeGuid == desiredSourceNodeGuid)
            {
                found = true;
            }
        }

        if (!found)
        {
            nodeGuidsToRemove.emplace_back(cacheEntryNodeGuid);
        }
    }
    for (Guid nodeGuid : nodeGuidsToRemove)
    {
        // remove the source
        std::vector<LiveLinkError> removeSourceErrors = callbacks.removeSource(cache.entries[nodeGuid].unrealGuid);
        append(errors, removeSourceErrors);

        // remove the cache entry
        cache.entries.erase(nodeGuid);
    }

    // loop over all desired sources in the json
    for (auto &desiredSource : desiredSources)
    {
        assert(!std::holds_alternative<std::monostate>(desiredSource));

        // get the node id of the source
        Guid nodeId = getNodeGuid(desiredSource);

        // get cache entry
        LiveLinkSourceCacheEntry *cacheEntry = nullptr;
        auto it = cache.entries.find(nodeId);
        if (it != cache.entries.end())
        {
            // cache entry found
            cacheEntry = &it->second;
        }

        // calculate new hash
        size_t newHash = 0;
        std::visit(
            [&](auto &&arg) {
                using T = std::decay_t<decltype(arg)>;
                if constexpr (!std::is_same_v<T, std::monostate>)
                {
                    using SettingsType = std::decay_t<decltype(arg.settings)>;
                    newHash = std::hash<SettingsType>{}(arg.settings);
                }
            },
            desiredSource);

        // create if we don't have a cache entry,
        // or if we have settings and the stored hash does not equal the new hash
        bool create = !cacheEntry || (cacheEntry->settingsHash != newHash);

        // first remove the source (also from cache) if we have to create, but we have a cache entry
        if (cacheEntry && create)
        {
            callbacks.removeSource(cacheEntry->unrealGuid);
            cache.entries.erase(nodeId);
            cacheEntry = nullptr;
        }

        if (create)
        {
            Guid unrealId{};
            std::vector<LiveLinkError> createSourceErrors = callbacks.createSource(desiredSource, unrealId);
            if (createSourceErrors.empty())
            {
                // create new cache entry if we have created the new source
                cache.entries.emplace(
                    nodeId,
                    LiveLinkSourceCacheEntry{.unrealGuid = unrealId, .settingsHash = newHash, .value = desiredSource});
            }
            else
            {
                for (auto &e : createSourceErrors)
                {
                    e.sourceId = nodeId;
                }
                append(errors, createSourceErrors);
            }
        }
        else
        {
            std::vector<LiveLinkError> updateSourceErrors =
                callbacks.updateSource(desiredSource, cacheEntry->unrealGuid);
            if (updateSourceErrors.empty())
            {
                cacheEntry->settingsHash = newHash;
                cacheEntry->value = desiredSource;
            }
            else
            {
                cache.entries.erase(nodeId);
                for (auto &e : updateSourceErrors)
                {
                    e.sourceId = nodeId;
                }
                append(errors, updateSourceErrors);
            }
        }
    }

    return errors;
}
} // namespace xrit_unreal