#pragma once
#include "FXritContext.h"
#include <XritConvert.h>

#include "LogCategory.h"
#include "Logging/StructuredLog.h"
#define LOCTEXT_NAMESPACE "Xrit"

#include "XritMacros.h"

THIRD_PARTY_INCLUDES_START // required to make sure unreal doesn't treat warnings as errors
XRIT_DISABLE_WARNINGS // additional errors
#include <xrit_unreal/communication_protocol.h>
#include <xrit_unreal/data/configuration.h>
#include <xrit_unreal/reflect/parse.h>
#include <xrit_unreal/reflect/serialize.h>
#include <xrit_unreal/websocket.h>
#include <xrit_unreal/livelink.h>
THIRD_PARTY_INCLUDES_END
XRIT_ENABLE_WARNINGS


// because LiveLink only returns the LiveLink source type name (instead of the real type), via `GetSourceType(FGuid)`,
// we need to map this. This is hacky, but since we're not allowed to change the LiveLink plugin source, this is necessary.

constexpr std::string_view InvalidLiveLinkSourceTypeString = "Invalid Source Type";


// communication with Xrit node on a separate thread
class XritCommunication final : FRunnable, xrit_unreal::IWebSocketListener
{
	static void ConfigurationSetUdpUnicastEndpoint(FXritContext& Context, xrit_unreal::Ip Ip);

	template <typename T>
	[[nodiscard]] static constexpr std::string_view GetLiveLinkSourceType()
	{
		if constexpr (std::is_same_v<T, xrit_unreal::LiveLinkMvnSource>) { return "MVN Live"; }
		else if constexpr (std::is_same_v<T, xrit_unreal::LiveLinkDummySource>) { return "Dummy Source"; }
		else if constexpr (std::is_same_v<T, xrit_unreal::LiveLinkOptitrackSource>) { return "OptiTrack"; }
		else if constexpr (std::is_same_v<T, xrit_unreal::LiveLinkXrSource>) { return "XR"; }
		else if constexpr (std::is_same_v<T, xrit_unreal::LiveLinkFreeDSource>) { return "FreeD"; }
		else
		{
			check(false);
			return "";
		}
	}

	//TODO: Move this and other functions like this somewhere in a different file
public:
	[[nodiscard]] static EIntegration LiveLinkSourceTypeStringToEIntegration(FText sourceTypeString)
	{
		if (sourceTypeString.ToString() == TEXT("MVN Live"))
		{
			return EIntegration::LiveLinkMvn;
		}
		else if (sourceTypeString.ToString() == TEXT("Dummy Source"))
		{
			return EIntegration::LiveLinkDummy;
		}
		else if (sourceTypeString.ToString() == TEXT("OptiTrack"))
		{
			return EIntegration::LiveLinkOptitrack;
		}
		else if (sourceTypeString.ToString() == TEXT("XR"))
		{
			return EIntegration::LiveLinkXr;
		}
		else if (sourceTypeString.ToString() == TEXT("FreeD"))
		{
			return EIntegration::LiveLinkFreeD;
		}
		else
		{
			return EIntegration::Invalid;
		}
	}
private:

	using LiveLinkErrors = std::vector<xrit_unreal::LiveLinkError>;


	template <typename SourceType>
	[[nodiscard]] static constexpr EIntegration LiveLinkSourceToEIntegration()
	{
		using Type = std::decay_t<SourceType>;
		if constexpr (std::is_same_v<Type, xrit_unreal::LiveLinkDummySource>) { return EIntegration::LiveLinkDummy; }
		else if constexpr (std::is_same_v<Type, xrit_unreal::LiveLinkMvnSource>) { return EIntegration::LiveLinkMvn; }
		else if constexpr (std::is_same_v<Type, xrit_unreal::LiveLinkOptitrackSource>) { return EIntegration::LiveLinkOptitrack; }
		else if constexpr (std::is_same_v<Type, xrit_unreal::LiveLinkXrSource>) { return EIntegration::LiveLinkXr; }
		else if constexpr (std::is_same_v<Type, xrit_unreal::LiveLinkFreeDSource>) { return EIntegration::LiveLinkFreeD; }
		else { return EIntegration::Invalid; }
	}


	static void SetLiveLinkSourceSettings(FXritContext& Context, xrit_unreal::Guid& UnrealGuid, xrit_unreal::LiveLinkSourceSettings const& SourceSettings);

	static LiveLinkErrors CreateLiveLinkSource(FXritContext& Context, xrit_unreal::LiveLinkSourceVariants const& Source, xrit_unreal::Guid& OutUnrealGuid);
	static LiveLinkErrors RemoveLiveLinkSource(FXritContext& Context, xrit_unreal::Guid UnrealGuid);
	static LiveLinkErrors UpdateLiveLinkSource(FXritContext& Context, xrit_unreal::LiveLinkSourceVariants const& Source, xrit_unreal::Guid UnrealId);

	// checks whether the current type string of the source is the same as the one stored in the cache
	[[nodiscard]] static bool LiveLinkCacheEntryIsValid(FXritContext& Context, xrit_unreal::LiveLinkSourceCacheEntry& Entry);

	// update the livelink source data in the cache
	static void UpdateLiveLinkSourceCacheEntry(FXritContext& Context, xrit_unreal::Guid NodeGuid, xrit_unreal::LiveLinkSourceCacheEntry& Entry);

	// sends the current status to the XR-IT Node
	static void SendStatus(FXritContext& Context, xrit_unreal::WebSocket& Caller);

	static xrit_unreal::SetConfigurationResult SetConfiguration(FXritContext& Context, std::string const& Data);

	// sets the configuration asynchronously (on a separate thread), and after this sends a message back to the XR-IT Node with the result 
	static void SetConfigurationAsync(FXritContext& Context, xrit_unreal::WebSocket& Caller, std::string_view Data);

public:
	explicit XritCommunication(FXritContext& Context, xrit_unreal::WebSocketConfiguration const& Config) : Context(Context), WebSocket(Config)
	{
		WebSocket.listener = this;
	}

	virtual ~XritCommunication() override
	{
		Stop();

		// destroy thread
		if (Thread != nullptr)
		{
			Thread->WaitForCompletion();
			delete Thread;
			Thread = nullptr;
		}
	}

	// FRunnable implementation

	void Start()
	{
		Thread = FRunnableThread::Create(this, TEXT("XritCommunication"), 0, TPri_BelowNormal);
		check(Thread);
	}

	virtual uint32 Run() override
	{
		while (!bStopping && WebSocket.poll() == xrit_unreal::WebSocketStatus::Success)
		{
			if (Context.bReconnect)
			{
				WebSocket.reconnect();
				UE_LOGFMT(XritModule, Display, "Attempt reconnection with Xrit Node");
				Context.bReconnect = false;
			}

			FPlatformProcess::Sleep(0.01f);
		}
		return 0;
	}

	virtual void Stop() override
	{
		bStopping = true;
	}

	// IWebSocketListener implementation

	virtual void onDisconnected(xrit_unreal::WebSocket* Caller) override
	{
		UE_LOGFMT(XritModule, Display, "Unreal service disconnected from XRIT Node");
	}

	virtual void onConnected(xrit_unreal::WebSocket* Caller) override
	{
		UE_LOGFMT(XritModule, Display, "Unreal service connected to XRIT Node");

		// send initialized to node
		Caller->sendMessage(xrit_unreal::createNodeMessage(xrit_unreal::NodeCommand::initialized, {}));
	}

	virtual void onMessage(xrit_unreal::WebSocket* Caller, std::string Message) override
	{
		UE_LOGFMT(XritModule, Display, "OnMessage: {0}", Message.c_str());
		xrit_unreal::MessageData MessageData;
		xrit_unreal::UnrealMessageData UnrealMessageData;
		if (xrit_unreal::getMessageData(Message, &MessageData) && xrit_unreal::getUnrealMessage(MessageData, UnrealMessageData))
		{
			// successfully retrieved unreal message
			switch (UnrealMessageData.command)
			{
			case xrit_unreal::UnrealCommand::set_configuration:
			{
				SetConfigurationAsync(Context, *Caller, UnrealMessageData.data);
				break;
			}
			case xrit_unreal::UnrealCommand::get_status:
			{
				SendStatus(Context, *Caller);
				break;
			}
			default:
			{
				UE_LOGFMT(XritModule, Warning, "Invalid command received in message from Node: {0}", Message.c_str());
			}
			}
		}
		else
		{
			UE_LOGFMT(XritModule, Warning, "Received ill-formed message from Node: {0}", Message.c_str());
		}
	}

private:
	FXritContext& Context;
	std::atomic<bool> bStopping = false;
	FRunnableThread* Thread = nullptr;
	xrit_unreal::WebSocket WebSocket;
};