#pragma once

#include "LiveLinkDummySourceSettings.generated.h"

class IStructureDetailsView;

//  source settings
USTRUCT()
struct FLiveLinkDummySourceSettings final
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, Category = "Settings")
	FString IPAddress = TEXT("1.2.3.4");

	UPROPERTY(EditAnywhere, Category = "Settings")
	uint16 UDPPort = 8000;
};
