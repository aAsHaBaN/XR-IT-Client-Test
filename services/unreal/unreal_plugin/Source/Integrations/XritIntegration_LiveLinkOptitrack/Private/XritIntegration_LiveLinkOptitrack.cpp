#include "XritIntegration_LiveLinkOptitrack.h"

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"
#include "UObject/UObjectIterator.h"

#include "XritConvert.h"
#include "LiveLinkNatNetSource.h"
#include "LiveLinkNatNetSourceFactory.h"

extern "C"
{
	xrit_unreal::Guid CreateLiveLinkOptitrackSourceImpl(ILiveLinkClient& Client, xrit_unreal::LiveLinkOptitrackSourceSettings const& Settings)
	{
		FOptitrackLiveLinkSettings OptitrackSettings;
		OptitrackSettings.ClientIpAddress = XritConvert::ToFString(Settings.client_address);
		OptitrackSettings.ServerIpAddress = XritConvert::ToFString(Settings.server_address);
		OptitrackSettings.ConnectionType = Settings.is_multicast ? EOptitrackLiveLinkConnectionType::Multicast : EOptitrackLiveLinkConnectionType::Unicast;
		OptitrackSettings.ConnectAutomatically = false;

		TSharedPtr<ILiveLinkSource> const CreatedSource = MakeShared<FLiveLinkNatNetSource>(OptitrackSettings);

		FGuid const Guid = Client.AddSource(CreatedSource);
		return XritConvert::ToXritGuid(Guid);
	}
}

IMPLEMENT_MODULE(FDefaultModuleImpl, XritIntegration_LiveLinkOptitrack)