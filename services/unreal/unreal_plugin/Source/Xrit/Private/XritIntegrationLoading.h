#pragma once

#include <XritIntegration_LiveLinkDummy.h>
#include <XritIntegration_LiveLinkMvn.h>
#include <XritIntegration_LiveLinkOptitrack.h>
#include <XritIntegration_LiveLinkXr.h>
#include <XritIntegration_LiveLinkFreeD.h>

UENUM(BlueprintType)
enum class EIntegration
{
	Invalid = 0 UMETA(DisplayName = "Invalid"),
	LiveLinkDummy = 1 UMETA(DisplayName = "LiveLink Dummy"),
	LiveLinkMvn UMETA(DisplayName = "Mvn"),
	LiveLinkOptitrack UMETA(DisplayName = "Optitrack"),
	LiveLinkXr UMETA(DisplayName = "Xr"),
	LiveLinkFreeD UMETA(DisplayName = "FreeD"),
	Count
};

enum EIntegrationFlags
{
	EIntegrationFlags_None = 0,
	EIntegrationFlags_LiveLinkDummy = 1 << 0,
	EIntegrationFlags_LiveLinkMvn = 1 << 1,
	EIntegrationFlags_LiveLinkOptitrack = 1 << 2,
	EIntegrationFlags_LiveLinkXr = 1 << 3,
	EIntegrationFlags_LiveLinkFreeD = 1 << 4
};

struct FIntegrationData
{
	FString PluginName;
	FName IntegrationModuleName;
};

// integrations for optional plugins (e.g. Mvn, Optitrack)
// 
// For each optional plugin dependency, we add a wrapper `DLL` (read "Module"), to which we explicitly link inside the main Xrit `DLL` if that plugin was found.
// Each of these wrapper `DLL`s contains exported `extern "C"` functions, of which we obtain function pointers, which we can call directly inside the Xrit `DLL`.
struct FXritIntegrations
{
	// to quickly determine which integrations are loaded
	EIntegrationFlags Flags;

	// loaded function pointers:
	FXritIntegration_LiveLinkDummy LiveLinkDummy;
	FXritIntegration_LiveLinkMvn LiveLinkMvn;
	FXritIntegration_LiveLinkOptitrack LiveLinkOptitrack;
	FXritIntegration_LiveLinkXr LiveLinkXr;
	FXritIntegration_LiveLinkFreeD LiveLinkFreeD;
};

[[nodiscard]] EIntegrationFlags EIntegrationToFlags(EIntegration Value);

// returns whether successfully loaded
[[nodiscard]] bool LoadIntegrationImpl(FXritIntegrations& Integrations, EIntegration const Integration, void*& OutHandle);

void LoadIntegrations(FXritIntegrations& Integrations);

template <EIntegration Integration>
auto& GetIntegration(FXritIntegrations& Integrations)
{
	if constexpr (Integration == EIntegration::LiveLinkDummy) { return Integrations.LiveLinkDummy; }
	else if constexpr (Integration == EIntegration::LiveLinkMvn) { return Integrations.LiveLinkMvn; }
	else if constexpr (Integration == EIntegration::LiveLinkOptitrack) { return Integrations.LiveLinkOptitrack; }
	else if constexpr (Integration == EIntegration::LiveLinkXr) { return Integrations.LiveLinkXr; }
	else if constexpr (Integration == EIntegration::LiveLinkFreeD) { return Integrations.LiveLinkFreeD; }
	else
	{
		check(false);
		static bool Invalid;
		return Invalid;
	}
}

template <EIntegration Integration>
void LoadIntegration(FXritIntegrations& Integrations)
{
	if (void* Handle = nullptr; LoadIntegrationImpl(Integrations, Integration, Handle))
	{
		check(Handle);
		// when this fails, it could be that the 
		Load(Handle, GetIntegration<Integration>(Integrations));
	}
}
