#include "XRIT_BPFL_MocapFunctions.h"
#include "XritActorManager.h"
#include "IXritModule.h"

void UXRIT_BPFL_MocapFunctions::RegisterMocapActorCallibration(AActor* actor, FVector position, FRotator rotation)
{
	//FModuleManager::Get().GetModuleChecked<IXritModule>("Xrit");

	FXritContext& context = IXritModule::Get().GetContext();
	XritActorManager* actorManager = context.ActorSpawner.Get();

	actorManager->SetSubjectCallibrationData(actor, position, rotation);
}
