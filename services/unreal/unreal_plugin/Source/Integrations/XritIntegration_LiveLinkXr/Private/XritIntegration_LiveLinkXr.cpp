#include "XritIntegration_LiveLinkXr.h"

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

#include "LiveLinkXRSource.h"
#include "XritConvert.h"

extern "C"
{
    xrit_unreal::Guid CreateLiveLinkXrSourceImpl(ILiveLinkClient& Client, xrit_unreal::LiveLinkXrSourceSettings const& Settings)
    {
        // set variables here that can't be changed afterwards
        FLiveLinkXRConnectionSettings S{
            .bTrackTrackers = Settings.track_trackers,
            .bTrackControllers = Settings.track_controllers,
            .bTrackHMDs = Settings.track_hmds,
            .LocalUpdateRateInHz = static_cast<uint32_t>(Settings.local_update_rate_in_hz)
        };
        TSharedPtr<ILiveLinkSource> const CreatedSource = MakeShared<FLiveLinkXRSource>(S);
        FGuid const Guid = Client.AddSource(CreatedSource);
        return XritConvert::ToXritGuid(Guid);
    }
}

IMPLEMENT_MODULE(FDefaultModuleImpl, XritIntegration_LiveLinkXr)