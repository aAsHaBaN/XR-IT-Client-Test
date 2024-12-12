#include "XritIntegration_LiveLinkMvn.h"

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

#include "XritConvert.h"
#include "LiveLinkMvnSource.h"

extern "C"
{
    xrit_unreal::Guid CreateLiveLinkMvnSourceImpl(ILiveLinkClient& Client, xrit_unreal::LiveLinkMvnSourceSettings const& Settings)
    {
        // set variables here that can't be changed afterwards
        TSharedPtr<ILiveLinkSource> const CreatedSource = MakeShared<FLiveLinkMvnSource>(Settings.port, true);
        FGuid const Guid = Client.AddSource(CreatedSource);
        return XritConvert::ToXritGuid(Guid);
    }
}

IMPLEMENT_MODULE(FDefaultModuleImpl, XritIntegration_LiveLinkMvn)