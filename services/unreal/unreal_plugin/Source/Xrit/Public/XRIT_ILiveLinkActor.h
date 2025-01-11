#pragma once

#include "CoreMinimal.h"
#include "LiveLinkTypes.h"
#include "UObject/Interface.h"
#include "XRIT_ILiveLinkActor.generated.h"

// This class does not need to be modified.
UINTERFACE(MinimalAPI, Blueprintable)
class UXRIT_ILiveLinkActor : public UInterface
{
	GENERATED_BODY()
};

class XRIT_API IXRIT_ILiveLinkActor
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintNativeEvent, BlueprintCallable, CallInEditor, Category = Xrit)
	bool SetLiveLinkSubject(FLiveLinkSubjectName subjectName);
};
