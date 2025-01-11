#include "XritIntegrationLoading.h"

#include "Interfaces/IPluginManager.h"

// logging
#include "LogCategory.h"
#include "Logging/StructuredLog.h"
#define LOCTEXT_NAMESPACE "Xrit"

std::unordered_map<EIntegration, FIntegrationData> IntegrationData{
	{EIntegration::LiveLinkDummy, {.PluginName = "DummyPlugin", .IntegrationModuleName = "XritIntegration_LiveLinkDummy"}},
	{EIntegration::LiveLinkMvn, {.PluginName = "LiveLinkMvnPlugin", .IntegrationModuleName = "XritIntegration_LiveLinkMvn"}},
	{EIntegration::LiveLinkOptitrack, {.PluginName = "OptitrackLiveLink", .IntegrationModuleName = "XritIntegration_LiveLinkOptitrack"}},
	{EIntegration::LiveLinkXr, {.PluginName = "LiveLinkXR", .IntegrationModuleName = "XritIntegration_LiveLinkXr"}},
	{EIntegration::LiveLinkFreeD, {.PluginName = "LiveLinkFreeD", .IntegrationModuleName = "XritIntegration_LiveLinkFreeD"}}
};

EIntegrationFlags EIntegrationToFlags(EIntegration Value) {
	switch (Value)
	{
	case EIntegration::LiveLinkDummy: return EIntegrationFlags_LiveLinkDummy;
	case EIntegration::LiveLinkMvn: return EIntegrationFlags_LiveLinkMvn;
	case EIntegration::LiveLinkOptitrack: return EIntegrationFlags_LiveLinkOptitrack;
	case EIntegration::LiveLinkXr: return EIntegrationFlags_LiveLinkXr;
	case EIntegration::LiveLinkFreeD: return EIntegrationFlags_LiveLinkFreeD;
	default: return EIntegrationFlags_None;
	}
}

bool LoadIntegrationImpl(FXritIntegrations& Integrations, EIntegration const Integration, void*& OutHandle) {
	FModuleManager& Modules = FModuleManager::Get();
	IPluginManager& Plugins = IPluginManager::Get();

	FIntegrationData const Data = IntegrationData[Integration];

	// assert that the optional integration module is not loaded yet
	check(!Modules.IsModuleLoaded(Data.IntegrationModuleName));

	TSharedPtr<IPlugin> const OptionalPlugin = Plugins.FindPlugin(Data.PluginName);
	if (OptionalPlugin.IsValid() && OptionalPlugin->IsEnabled())
	{
		// load integration module
		EModuleLoadResult Result;
		check(Modules.ModuleExists(*Data.IntegrationModuleName.ToString()));

		IModuleInterface* IntegrationModule = Modules.LoadModuleWithFailureReason(Data.IntegrationModuleName, Result);

		// handle failure cases
		if (Result == EModuleLoadResult::CouldNotBeLoadedByOS)
		{
			// why does this happen? (i.e. why can a plugin be enabled when it is not supported on a given platform, e.g. LiveLinkMvnPlugin on macOS)
			return false;
		}

		check(Result == EModuleLoadResult::Success);
		check(IntegrationModule);

		FString ModuleFileName = Modules.GetModuleFilename(Data.IntegrationModuleName);
		check(FPaths::FileExists(ModuleFileName));
		OutHandle = FPlatformProcess::GetDllHandle(*ModuleFileName);
		check(OutHandle);

		// set the flag
		Integrations.Flags = static_cast<EIntegrationFlags>(Integrations.Flags | EIntegrationToFlags(Integration));

		// log
		UE_LOGFMT(XritModule, Display, "Loaded {0} for {1}", Data.IntegrationModuleName, Data.PluginName);

		return true;
	}
	return false;
}

void LoadIntegrations(FXritIntegrations& Integrations) {
	// load optional integrations
	LoadIntegration<EIntegration::LiveLinkDummy>(Integrations);
	LoadIntegration<EIntegration::LiveLinkMvn>(Integrations);
	LoadIntegration<EIntegration::LiveLinkOptitrack>(Integrations);
	LoadIntegration<EIntegration::LiveLinkXr>(Integrations);
	LoadIntegration<EIntegration::LiveLinkFreeD>(Integrations);
}
