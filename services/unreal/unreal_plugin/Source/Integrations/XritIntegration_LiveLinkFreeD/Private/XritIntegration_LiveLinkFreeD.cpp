#include "XritIntegration_LiveLinkFreeD.h"

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

#include "LiveLinkFreeDSource.h"

#include "XritConvert.h"

extern "C"
{
    xrit_unreal::Guid CreateLiveLinkFreeDSourceImpl(ILiveLinkClient& Client, xrit_unreal::LiveLinkFreeDSourceSettings const& Settings)
    {
        // set variables here that can't be changed afterwards
        FLiveLinkFreeDConnectionSettings S{
            .IPAddress = XritConvert::ToFString(Settings.ip_address),
            .UDPPortNumber = static_cast<uint16_t>(Settings.udp_port)
        };
        TSharedPtr<ILiveLinkSource> const CreatedSource = MakeShared<FLiveLinkFreeDSource>(S);
        FGuid const Guid = Client.AddSource(CreatedSource);
        return XritConvert::ToXritGuid(Guid);
    }
}

IMPLEMENT_MODULE(FDefaultModuleImpl, XritIntegration_LiveLinkFreeD)