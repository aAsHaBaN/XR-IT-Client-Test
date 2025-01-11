#include "UXritClassesConfiguration.h"
#include "XritCommunication.h"

UXritClassesConfiguration::UXritClassesConfiguration() {}

TSubclassOf<AActor> UXritClassesConfiguration::GetClassForIntegration(EIntegration integration)
{
	return ClassReferences.FindRef(integration);
}

TSubclassOf<AActor> UXritClassesConfiguration::GetClassForSourceType(FText sourceType)
{
	EIntegration sourceIntegration = XritCommunication::LiveLinkSourceTypeStringToEIntegration(sourceType);
	return GetClassForIntegration(sourceIntegration);
}
