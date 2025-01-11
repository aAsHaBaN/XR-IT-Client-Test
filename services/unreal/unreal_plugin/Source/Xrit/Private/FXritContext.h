#pragma once
#include "XritIntegrationLoading.h"
#include "xrit_unreal/livelink.h"

#include "LiveLinkClientReference.h"
#include "LiveLinkSettings.h"
#include "LiveLinkComponentSettings.h"
#include "ILiveLinkClient.h"

#include "Shared/UdpMessagingSettings.h"

class XritCommunication;
class XritActorManager;

struct FXritContext
{
	// UI
	TSharedPtr<FWorkspaceItem> XritWorkspaceMenuCategory;
	TSharedPtr<FExtender> XritMenuExtender;

	// integrations for optional plugins (e.g. Mvn, Optitrack)
	FXritIntegrations OptionalIntegrations;

	// live link
	FLiveLinkClientReference LiveLinkClientReference;
	ILiveLinkClient* GetLiveLinkClient() const { return LiveLinkClientReference.GetClient(); }
	ULiveLinkSettings* LiveLinkSettings = nullptr;
	ULiveLinkComponentSettings* LiveLinkComponentSettings = nullptr;
	xrit_unreal::LiveLinkSourceCache LiveLinkSourceCache;

	// udp
	UUdpMessagingSettings* UdpMessagingSettings = nullptr;

	// whether to reconnect the websocket connection with the XR-IT Node
	std::atomic<bool> bReconnect = false;
	std::atomic<bool> bShouldAutoSpawnActors = true;

	// communication with node
	TUniquePtr<XritCommunication> Communication;
	TUniquePtr<XritActorManager> ActorSpawner;
};