#pragma once

#include "FXritContext.h"
#include "XritConvert.h"
#include <UXritClassesConfiguration.h>

#if WITH_EDITOR
#include "Editor.h"
#endif

class XritActorManager
{
public:
	XritActorManager(FXritContext& context)
		: Context(context)
	{
	}

	~XritActorManager()
	{
		StopTrackingActors();
		ClearAllActors();
	}

	void StartTrackingActors();
	void StopTrackingActors();
	void UnRegisterCleanupCallbacks();
	bool TickActorTracking(float DeltaTime);

	template <typename T>
	T* FindActorOfClassByName(FString ActorName); 
	AActor* FindActorByClassAndName(TSubclassOf<AActor> ActorClass, FString ActorName);

	void SetSubjectCallibrationData(AActor* Actor, FVector position, FRotator rotation);

private:
	UWorld* FindCurrentWorld();
	UXritClassesConfiguration* GetClassesConfiguration();

	void CleanInvalidActors(UWorld* currentWorld);
	void ClearAllActors();

	struct ActorInfo {
		TWeakObjectPtr<AActor> Actor;
		FString ActorName;
	};

	struct CallibrationData
	{
		FVector Position;
		FRotator Rotation;
	};

	TMap<FLiveLinkSubjectKey, ActorInfo> SubjectToActor;
	TMap<FLiveLinkSubjectKey, CallibrationData> SubjectsCallibration;
	FTSTicker::FDelegateHandle ActorSpawningTickHandle;
	FXritContext& Context;
	TWeakObjectPtr<UXritClassesConfiguration> ClassesConfiguration;

	void RegisterCleanupCallbacks();
	FDelegateHandle ModulesChangedDelegateHandle;

	void OnModulesChanged(FName ModuleName, EModuleChangeReason Reason)
	{
#if !IS_MONOLITHIC
		if (Reason == EModuleChangeReason::ModuleUnloaded)
		{
			ClearAllActors();
		}
#endif
	}

	TWeakObjectPtr<AActor> SpawnActor(FLiveLinkSubjectKey SubjectKey, ILiveLinkClient* client, UXritClassesConfiguration* classesConfiguration, UWorld* world);
};

template <typename T>
T* XritActorManager::FindActorOfClassByName(FString ActorName)
{
	UWorld* World = FindCurrentWorld();

	for (TActorIterator<T> It(World); It; ++It)
	{
		if (It->GetName() == ActorName)
		{
			return *It;
		}
	}
	return nullptr;
}