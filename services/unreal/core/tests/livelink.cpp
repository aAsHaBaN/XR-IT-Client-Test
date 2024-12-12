#include <gtest/gtest.h>

#include <xrit_unreal/livelink.h>
#include <xrit_unreal/generate_mock_data.h>

#include <unordered_map>

namespace xrit_unreal::livelink_tests
{
    struct MockSource
    {

    };

    struct MockUnreal
    {
        std::unordered_map<Guid, MockSource> mockSources;
    };

    void assertCount(MockUnreal& mockUnreal, LiveLinkSourceCache& cache, size_t count)
    {
        ASSERT_EQ(cache.entries.size(), count);
        ASSERT_EQ(mockUnreal.mockSources.size(), count);
    }

    void assertExists(MockUnreal& mockUnreal, LiveLinkSourceCache& cache, Guid nodeGuid, bool shouldExist)
    {
        ASSERT_EQ(cache.entries.contains(nodeGuid), shouldExist);
        ASSERT_EQ(mockUnreal.mockSources.contains(cache.entries[nodeGuid].unrealGuid), shouldExist);
    }

    TEST(LiveLink, UpdateLiveLinkSources)
    {
        // empty cache to start
        LiveLinkSourceCache cache{};

        MockUnreal mockUnreal{};

        LiveLinkCallbacks callbacks{
            .removeSource = [&](Guid unrealGuid) -> std::vector<LiveLinkError> {
                std::cout << "removed source" << std::endl;
                mockUnreal.mockSources.erase(unrealGuid);
                return {};
            },
            .createSource = [&](LiveLinkSourceVariants const& source, Guid& outUnrealId) -> std::vector<LiveLinkError> {
                std::cout << "created source" << std::endl;
                Guid guid = generateMockGuid();
                mockUnreal.mockSources.emplace(guid, MockSource{});
                outUnrealId = guid;
                return {};
            },
            .updateSource = [&](LiveLinkSourceVariants const& source, Guid unrealId) -> std::vector<LiveLinkError> {
                std::cout << "updated source" << std::endl;
                assert(mockUnreal.mockSources.contains(unrealId));
                return {};
            }
        };

        Guid id1 = generateMockGuid();
        Guid id2 = generateMockGuid();

        std::vector<LiveLinkSourceVariants> desiredSources{
            LiveLinkDummySource{
                .id = id1,
                .settings{
                    .ip_address = "1",
                    .port = 1
                }
            },
            LiveLinkDummySource{
                .id = id2,
                .settings{
                    .ip_address = "1",
                    .port = 1
                }
            }
        };

        ASSERT_TRUE(cache.entries.empty());
        std::vector<LiveLinkError> errors = setLiveLinkSources(cache, desiredSources, callbacks);
        ASSERT_TRUE(errors.empty());
        assertCount(mockUnreal, cache, 2);
        assertExists(mockUnreal, cache, id1, true);
        assertExists(mockUnreal, cache, id2, true);

        // this should remove the dummy source with id2
        std::vector<LiveLinkSourceVariants> desiredSources2{
            LiveLinkDummySource{
                .id = id1,
                .settings{
                    .ip_address = "1",
                    .port = 1
                }
            }
        };
        errors = setLiveLinkSources(cache, desiredSources2, callbacks);
        ASSERT_TRUE(errors.empty());
        assertCount(mockUnreal, cache, 1);
        assertExists(mockUnreal, cache, id1, true);
        assertExists(mockUnreal, cache, id2, false);
    }
}
