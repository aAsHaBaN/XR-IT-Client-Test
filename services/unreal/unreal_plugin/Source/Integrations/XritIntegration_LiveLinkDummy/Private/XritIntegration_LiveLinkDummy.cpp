#include "XritIntegration_LiveLinkDummy.h"

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

#include "XritConvert.h"
#include "LiveLinkDummySource.h"

extern "C"
{
    xrit_unreal::Guid CreateLiveLinkDummySourceImpl(ILiveLinkClient& Client, xrit_unreal::LiveLinkDummySourceSettings const& Settings)
    {
        // set variables here that can't be changed afterwards
        FLiveLinkDummySourceSettings S{
            .IPAddress = XritConvert::ToFString(Settings.ip_address),
            .UDPPort = static_cast<uint16_t>(Settings.port)
        };
        TSharedPtr<ILiveLinkSource> const CreatedSource = MakeShared<Xrit::FLiveLinkDummySource>(S);
        FGuid const Guid = Client.AddSource(CreatedSource);
        return XritConvert::ToXritGuid(Guid);
    }
}

IMPLEMENT_MODULE(FDefaultModuleImpl, XritIntegration_LiveLinkDummy)