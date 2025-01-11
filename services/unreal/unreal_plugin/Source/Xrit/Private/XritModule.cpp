#include "IXritModule.h"
#include "LevelEditor.h"

#include "LiveLinkSourceSettings.h"

#include "Widgets/XritWidget.h"

#include <FXritContext.h>
#include <XritCommunication.h>
#include <XritActorManager.h>
#include <XritSettingsHelpers.h>
#include <XritIntegrationLoading.h>
#include <XritConvert.h>

// logging
#include "Containers/Map.h"
#include <set>

#include "LogCategory.h"
#include "Logging/StructuredLog.h"
DEFINE_LOG_CATEGORY(XritModule);
#define LOCTEXT_NAMESPACE "Xrit"

// constants
FText const XritCategoryName = LOCTEXT("WorkspaceMenu_Xrit", "Xrit");
FName const XritMainTabId(TEXT("XritMain"));

struct FXritModule final : IXritModule
{
	// IModuleInterface implementation
	virtual void StartupModule() override;
	virtual void ShutdownModule() override;

	virtual FXritContext& GetContext() override { return Context; }

	FXritContext Context;
};

void StartCommunication(FXritContext& Context)
{
	// create runnable for communicating with the XR-IT Node over websockets
	xrit_unreal::WebSocketConfiguration Config{
		.url = "127.0.0.1",
		.port = 5000,
		.maxBytesPerFrame = 1024,
		.server = false,
	};
	Context.Communication = MakeUnique<XritCommunication>(Context, Config);
	Context.Communication->Start();
}

void StartActorManager(FXritContext& Context)
{
	Context.ActorSpawner = MakeUnique<XritActorManager>(Context);
	Context.ActorSpawner->StartTrackingActors();
}

TSharedRef<SDockTab> SpawnTabMain(FXritContext& Context, FSpawnTabArgs const& Args)
{
	check(Args.GetTabId() == XritMainTabId);

	TSharedRef<SDockTab> NewTab = SNew(SDockTab)
		.Label(LOCTEXT("MainTabTitle", "Xrit"))
		.TabRole(ETabRole::NomadTab);

	// populate with widget content
	FXritWidgetContext WidgetContext{
		.bReconnect = &Context.bReconnect,
		.bShouldAutoSpawnActors = &Context.bShouldAutoSpawnActors
	};
	NewTab->SetContent(SNew(SXritWidget).Context(WidgetContext));
	return NewTab;
}

void RegisterEditorExtensions(FXritContext& Context)
{
	FLevelEditorModule& LevelEditor = FModuleManager::LoadModuleChecked<FLevelEditorModule>(TEXT("LevelEditor"));

	// level editor module has not created the tab manager yet, so we have to listen to the changed event
	LevelEditor.OnTabManagerChanged().AddLambda([&]
	{
		auto const Tabs = LevelEditor.GetLevelEditorTabManager();
		Context.XritWorkspaceMenuCategory = Tabs->AddLocalWorkspaceMenuCategory(XritCategoryName);
		Tabs->RegisterTabSpawner(XritMainTabId, FOnSpawnTab::CreateLambda([&](FSpawnTabArgs const& Args)
		{
			return SpawnTabMain(Context, Args);
		}))
			.SetGroup(Context.XritWorkspaceMenuCategory.ToSharedRef())
			.SetDisplayName(LOCTEXT("MainTab", "Xrit Main"));
	});
}

void UnregisterEditorExtensions(FXritContext& Context)
{
	if (FModuleManager::Get().IsModuleLoaded("LevelEditor"))
	{
		FLevelEditorModule const& LevelEditorModule = FModuleManager::LoadModuleChecked<FLevelEditorModule>(TEXT("LevelEditor"));
		auto const Tabs = LevelEditorModule.GetLevelEditorTabManager();
		Tabs->UnregisterTabSpawner(XritMainTabId);
	}
}

// main entry point for the module / the XR-IT plugin
void FXritModule::StartupModule()
{
	UE_LOGFMT(XritModule, Display, "Start Xrit Module");

	// load integrations for optional plugins (e.g. Mvn, Optitrack)
	LoadIntegrations(Context.OptionalIntegrations);

	// register editor UI extensions, such as the Xrit Main window
	RegisterEditorExtensions(Context);

	// get udp settings
	Context.UdpMessagingSettings = GetSettingsObjectTyped<UUdpMessagingSettings>("Project", "Plugins", "UdpMessaging");

	// get livelink
	Context.LiveLinkSettings = GetSettingsObjectTyped<ULiveLinkSettings>("Project", "Plugins", "LiveLink");
	Context.LiveLinkComponentSettings = GetSettingsObjectTyped<ULiveLinkComponentSettings>("Project", "Plugins", "LiveLinkComponent");

	StartCommunication(Context);
	StartActorManager(Context);
}

void FXritModule::ShutdownModule()
{
	UE_LOGFMT(XritModule, Display, "Shutdown Xrit Module");

	UnregisterEditorExtensions(Context);

	Context.Communication->Stop();
}

IMPLEMENT_MODULE(FXritModule, XritModule)
