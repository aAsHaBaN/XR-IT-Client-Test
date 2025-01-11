#include "XritActorManager.h"
#include "XritCommunication.h"
#include <set>

#include "XRIT_ILiveLinkActor.h"
#include "XRIT_BP_Origin_Base.h"

#include "EngineUtils.h"

void XritActorManager::StartTrackingActors()
{
	// Register the ticker function
	ActorSpawningTickHandle = FTSTicker::GetCoreTicker().AddTicker(
		FTickerDelegate::CreateRaw(this, &XritActorManager::TickActorTracking),
		0.016f // Tick every 16ms (~60 FPS)
	);
	RegisterCleanupCallbacks();
}

void XritActorManager::StopTrackingActors()
{
	FTSTicker::GetCoreTicker().RemoveTicker(ActorSpawningTickHandle); 
	UnRegisterCleanupCallbacks();
}

inline void XritActorManager::RegisterCleanupCallbacks()
{
	FWorldDelegates::OnPreWorldFinishDestroy.AddLambda([this](UWorld* world)
		{
			// Ensure the object is valid and call Cleanup
			if (this)
			{
				ClearAllActors();
			}
		});
	ModulesChangedDelegateHandle = FModuleManager::Get().OnModulesChanged().AddRaw(this, &XritActorManager::OnModulesChanged);
}

void XritActorManager::UnRegisterCleanupCallbacks()
{
	FWorldDelegates::OnPreWorldFinishDestroy.RemoveAll(this);
	FModuleManager::Get().OnModulesChanged().Remove(ModulesChangedDelegateHandle);
}

UWorld* XritActorManager::FindCurrentWorld()
{
	const TIndirectArray<FWorldContext>& WorldContexts = GEngine->GetWorldContexts();
	UWorld* currentWorld = nullptr;
	EWorldType::Type currentWorldType = EWorldType::None;

	for (const FWorldContext& WorldContext : WorldContexts)
	{
		UWorld* world = WorldContext.World();

		if (!world->IsInitialized())
		{
			continue;
		}

		EWorldType::Type worldType = WorldContext.WorldType;
		switch (worldType)
		{
		case EWorldType::Game:
			return WorldContext.World();
			break;
		case EWorldType::Editor:
			if (currentWorldType != EWorldType::Game || currentWorldType != EWorldType::PIE)
			{
				currentWorld = WorldContext.World();
				currentWorldType = EWorldType::Editor;
			}
			break;
		case EWorldType::PIE:
			if (currentWorldType != EWorldType::Game)
			{
				currentWorld = WorldContext.World();
				currentWorldType = EWorldType::Editor;
			}
			break;
		default:
			break;
		}
	}
	check(currentWorld);
	return currentWorld;
}

bool XritActorManager::TickActorTracking(float DeltaTime) {

	if (Context.bShouldAutoSpawnActors == false)
	{
		ClearAllActors();
		return true;
	}

	auto currentWorld = FindCurrentWorld();
	check(currentWorld);

	if (currentWorld->FlushLevelStreamingType != EFlushLevelStreamingType::None)
	{
		//Level streaming is in progress. Wait till it's finished.
		return true;
	}

	CleanInvalidActors(currentWorld);

	ILiveLinkClient* client = Context.GetLiveLinkClient();

	UXritClassesConfiguration* classesConfiguration = GetClassesConfiguration();
	if (!classesConfiguration) {
		return true;
	}

	auto sources = client->GetSources();

	std::set<FGuid> xritSources;
	for (auto& entry : Context.LiveLinkSourceCache.entries)
	{
		xritSources.insert(XritConvert::ToFGuid(entry.second.unrealGuid));
	}

	auto subjects = client->GetSubjects(false, false);

	for (FLiveLinkSubjectKey subject : subjects) {
		FGuid subjectSourceGuid = subject.Source;

		auto xritSourceIter = xritSources.find(subjectSourceGuid);
		//if the subject is not controlled by XR-IT, skip it
		if (xritSourceIter == xritSources.end()) {
			continue;
		}

		ActorInfo* actorInfo = SubjectToActor.Find(subject);
		TWeakObjectPtr<AActor>* actorPtrPtr = actorInfo ? &actorInfo->Actor : nullptr;
		if (actorPtrPtr)
		{
			continue;
		}

		TWeakObjectPtr<AActor> spawnedActorPtr = SpawnActor(subject, client, classesConfiguration, currentWorld);
		if (spawnedActorPtr.IsValid() && spawnedActorPtr->IsValidLowLevel())
		{
			SubjectToActor.Add(subject, ActorInfo{ spawnedActorPtr, spawnedActorPtr->GetName() });
		}
	}

	return true; // Return true to keep ticking
}

TWeakObjectPtr<AActor> XritActorManager::SpawnActor(FLiveLinkSubjectKey subject, ILiveLinkClient* client, UXritClassesConfiguration* classesConfiguration, UWorld* world)
{
	FGuid subjectSourceGuid = subject.Source;

	FText sourceType = client->GetSourceType(subjectSourceGuid);
	auto classToInstantiate = classesConfiguration->GetClassForSourceType(sourceType);

	if (classToInstantiate == nullptr) {
		UE_LOGFMT(XritModule, Error, "No class to instantiate for source type {0}", sourceType.ToString());
		return nullptr;
	}

	bool isInterfaceImplemented = classToInstantiate->ImplementsInterface(UXRIT_ILiveLinkActor::StaticClass());

	if (!isInterfaceImplemented)
	{
		UE_LOGFMT(XritModule, Error, "Class {0} does not implement the interface UXRIT_ILiveLinkActor", classToInstantiate->GetName());
		return nullptr;
	}

	FActorSpawnParameters SpawnParams;
	FString actorName = "XRIT_AUTO_" + subject.SubjectName.ToString();
	SpawnParams.Name = FName(*actorName);
	SpawnParams.NameMode = FActorSpawnParameters::ESpawnActorNameMode::Requested;
	SpawnParams.ObjectFlags = RF_Transient;
	UE_LOGFMT(XritModule, Log, "Xrit Actor Manager: Spawning Actor");
	TWeakObjectPtr<AActor> actor = world->SpawnActor<AActor>(classToInstantiate, SpawnParams);
	//Unreal's display name in the editor is actually not the same as Name, so we make sure that it is
	actor->SetActorLabel(actor->GetName());

	if (!actor->IsValidLowLevel())
	{
		UE_LOGFMT(XritModule, Error, "Spawned actor is not valid!");
	}

	if (!actor->GetClass()->ImplementsInterface(UXRIT_ILiveLinkActor::StaticClass()))
	{
		UE_LOGFMT(XritModule, Error, "Spawned actor does not implement the interface UXRIT_ILiveLinkActor");
	}

	bool returnValue = IXRIT_ILiveLinkActor::Execute_SetLiveLinkSubject(actor.Get(), subject.SubjectName);
	check(returnValue);

	UE_LOGFMT(XritModule, Log, "SetLiveLinkSubject returned {0}", returnValue);

	if (SubjectsCallibration.Contains(subject))
	{
		AXRIT_BP_Origin_Base* origin = nullptr;
		for (TActorIterator<AXRIT_BP_Origin_Base> It(world); It; ++It)
		{
			if (origin != nullptr)
			{
				UE_LOGFMT(XritModule, Error, "Multiple XRIT Origins are not supported!");
				break;
			}
			origin = *It;
		}

		if (origin == nullptr)
		{
			UE_LOGFMT(XritModule, Warning, "No XRIT_BP_Origin found! Using 0,0,0 as origin!");
		}
		else
		{
			actor->GetRootComponent()->AttachToComponent(origin->GetRootComponent(), FAttachmentTransformRules::KeepRelativeTransform);
		}

		auto callibrationData = SubjectsCallibration[subject];
		actor->SetActorRelativeLocation(callibrationData.Position);
		actor->SetActorRelativeRotation(callibrationData.Rotation);
	}

	return actor;
}

UXritClassesConfiguration* XritActorManager::GetClassesConfiguration() {
	if (!ClassesConfiguration.IsValid())
	{
		ClassesConfiguration = Cast<UXritClassesConfiguration>(
			StaticLoadObject(UXritClassesConfiguration::StaticClass(), nullptr, TEXT("/Xrit/XRIT_Plugin/XRIT_DA_ClassesConfiguration.XRIT_DA_ClassesConfiguration"))
		);

		if (ClassesConfiguration.IsValid())
		{
			// Use your loaded data asset
			UE_LOG(LogTemp, Log, TEXT("Loaded Data Asset: %s"), *ClassesConfiguration->GetName());
		}
		else
		{
			UE_LOG(LogTemp, Error, TEXT("Failed to load data asset"));
		}
	}

	return ClassesConfiguration.Get();
}

void XritActorManager::CleanInvalidActors(UWorld* currentWorld) {
	TArray<FLiveLinkSubjectKey> actorKeysToRemove;

	for (auto Pair : SubjectToActor) {
		auto actorInfo = Pair.Value;
		//if the pointer is invalid, remove from the array
		if (!actorInfo.Actor.IsValid())
		{
			UE_LOGFMT(XritModule, Log, "Xrit Actor Manager: Removing Actor that has an invalid pointer");
			auto sourceType = Context.GetLiveLinkClient()->GetSourceType(Pair.Key.Source);
			auto actorClass = ClassesConfiguration->GetClassForSourceType(sourceType);
			AActor* existingActor = FindActorByClassAndName(actorClass, actorInfo.ActorName);
			if (existingActor->IsValidLowLevel())
			{
				existingActor->Destroy();
			}
			actorKeysToRemove.Add(Pair.Key);
			continue;
		}
		//if the actor is invalid, remove from the array
		if (!IsValid(actorInfo.Actor.Get()))
		{
			UE_LOGFMT(XritModule, Log, "Xrit Actor Manager: Removing Actor that is invalid");
			actorKeysToRemove.Add(Pair.Key);
			continue;
		}

		//if the actor is not in the world, destroy the actor and remove from the array
		if (actorInfo.Actor->GetWorld() != currentWorld)
		{
			UE_LOGFMT(XritModule, Log, "Xrit Actor Manager: Destroying Actor in different world");
			actorInfo.Actor->Destroy();
			actorKeysToRemove.Add(Pair.Key);
			continue;
		}

		ILiveLinkClient* client = Context.GetLiveLinkClient();
		auto subjects = client->GetSubjects(false, false);

		//if the subject is not in the list of subjects, remove the actor
		if (subjects.Find(Pair.Key) == INDEX_NONE)
		{
			UE_LOGFMT(XritModule, Log, "Xrit Actor Manager: Destroying Actor that doesn't have a live link subject");
			actorInfo.Actor->Destroy();
			actorKeysToRemove.Add(Pair.Key);
			continue;
		}
	}

	for (FLiveLinkSubjectKey key : actorKeysToRemove)
	{
		UE_LOGFMT(XritModule, Log, "Xrit Actor Manager: Removing Actor");
		SubjectToActor.Remove(key);
	}
}

void XritActorManager::ClearAllActors()
{
	for (auto Pair : SubjectToActor)
	{
		UE_LOGFMT(XritModule, Log, "Xrit Actor Manager: Removing Actor while removing all actors");
		auto actorPtr = Pair.Value;
		if (actorPtr.Actor.IsValid())
		{
			actorPtr.Actor->Destroy();
		}
	}
	SubjectToActor.Empty();
}

AActor* XritActorManager::FindActorByClassAndName(TSubclassOf<AActor> ActorClass, FString ActorName)
{
	UWorld* World = FindCurrentWorld();

	const EActorIteratorFlags Flags = EActorIteratorFlags::SkipPendingKill;
	for (TActorIterator<AActor> It(World, ActorClass, Flags); It; ++It)
	{
		if (It->GetName() == ActorName)
		{
			return *It;
		}
	}
	return nullptr;
}

void XritActorManager::SetSubjectCallibrationData(AActor* Actor, FVector position, FRotator rotation)
{
	for (auto Pair : SubjectToActor)
	{
		if (Pair.Value.Actor.Get() == Actor)
		{
			SubjectsCallibration.Add(Pair.Key, CallibrationData{ position, rotation });
			return;
		}
	}
	UE_LOGFMT(XritModule, Error, "Actor not found in the list of tracked actors");
}

