#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"

#include <XritIntegrationLoading.h>

#include "UXritClassesConfiguration.generated.h"

/**
 * A UObject-derived class that stores references to other classes.
 */
UCLASS(BlueprintType)
class XRIT_API UXritClassesConfiguration : public UPrimaryDataAsset
{
	GENERATED_BODY()

public:
	// Constructor
	UXritClassesConfiguration();

	/** Map to hold class references with enum keys */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "References")
	TMap<EIntegration, TSubclassOf<AActor>> ClassReferences;

	TSubclassOf<AActor> GetClassForIntegration(EIntegration integration);
	TSubclassOf<AActor> GetClassForSourceType(FText sourceType);

};
