#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"

#include <FxritContext.h>

#include "XRIT_BPFL_MocapFunctions.generated.h"

UCLASS()
class XRIT_API UXRIT_BPFL_MocapFunctions : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()
	
public:
	UFUNCTION(BlueprintCallable, Category="XRIT")
	static void RegisterMocapActorCallibration(AActor* actor, FVector position, FRotator rotation);

};
