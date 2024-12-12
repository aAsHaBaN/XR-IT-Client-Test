#include "XritCommunication.h"

void XritCommunication::ConfigurationSetUdpUnicastEndpoint(FXritContext& Context, xrit_unreal::Ip Ip) {
	FString Url = XritConvert::ToFString(Ip.url);

	// format is IP_ADDRESS:PORT_NUMBER
	FString UnicastEndpoint = FString::Format(TEXT("{0}:{1}"), { Url, Ip.port });
	Context.UdpMessagingSettings->UnicastEndpoint = UnicastEndpoint;
	UE_LOGFMT(XritModule, Display, "Set Unicast Endpoint: {0}", UnicastEndpoint);
}

XritCommunication::LiveLinkErrors XritCommunication::RemoveLiveLinkSource(FXritContext& Context,
	xrit_unreal::Guid UnrealGuid) {
	FGuid const Guid = XritConvert::ToFGuid(UnrealGuid);

	// ensure the source still exists
	std::string const SourceType = XritConvert::ToStdString(Context.GetLiveLinkClient()->GetSourceType(Guid));
	if (SourceType == "Invalid")
	{
		return { xrit_unreal::LiveLinkError{xrit_unreal::LiveLinkErrorCode::SourceDoesNotExist} };
	}

	UE_LOGFMT(XritModule, Display, "Removed source {0}", XritConvert::ToFString(SourceType));

	Context.GetLiveLinkClient()->RemoveSource(XritConvert::ToFGuid(UnrealGuid));
	return {};
}

void XritCommunication::SetLiveLinkSourceSettings(FXritContext& Context, xrit_unreal::Guid& UnrealGuid,
	xrit_unreal::LiveLinkSourceSettings const& SourceSettings) {
	ULiveLinkSourceSettings* Out = Context.GetLiveLinkClient()->GetSourceSettings(XritConvert::ToFGuid(UnrealGuid));
	check(Out);

	Out->Mode = XritConvert::ToELiveLinkSourceMode(SourceSettings.mode);

	FLiveLinkSourceBufferManagementSettings& BOut = Out->BufferSettings;
	xrit_unreal::LiveLinkSourceBufferManagementSettings const& BIn = SourceSettings.buffer_settings;

	BOut.bValidEngineTimeEnabled = BIn.valid_engine_time_enabled;
	BOut.ValidEngineTime = BIn.valid_engine_time;
	BOut.EngineTimeOffset = BIn.engine_time_offset;
	BOut.bGenerateSubFrame = BIn.generate_sub_frame;
	BOut.bUseTimecodeSmoothLatest = BIn.use_timecode_smooth_latest;
	BOut.SourceTimecodeFrameRate = XritConvert::ToFFramerate(BIn.source_timecode_framerate);
	BOut.bValidTimecodeFrameEnabled = BIn.valid_timecode_frame_enabled;
	BOut.ValidTimecodeFrame = BIn.valid_timecode_frame;
	BOut.TimecodeFrameOffset = BIn.timecode_frame_offset;
	BOut.LatestOffset = BIn.latest_offset;
	BOut.MaxNumberOfFrameToBuffered = BIn.max_number_of_frames_to_buffer;
	BOut.bKeepAtLeastOneFrame = BIn.keep_at_least_one_frame;
}

XritCommunication::LiveLinkErrors XritCommunication::CreateLiveLinkSource(FXritContext& Context,
	xrit_unreal::LiveLinkSourceVariants const& Source, xrit_unreal::Guid& OutUnrealGuid) {
	FXritIntegrations& Integrations = Context.OptionalIntegrations;
	ILiveLinkClient& Client = *Context.LiveLinkClientReference.GetClient();

	std::vector<xrit_unreal::LiveLinkError> Errors;

	std::visit([&]<typename T>(T && Arg)
	{
		using Type = std::decay_t<T>;
		if constexpr (std::is_same_v<Type, std::monostate>)
		{
			Errors.emplace_back(xrit_unreal::LiveLinkError{ xrit_unreal::LiveLinkErrorCode::InternalError });
		}
		else
		{
			// check if the integration is loaded
			// we separate this from each separate function call as each function calls this exact same check
			constexpr EIntegration Integration = LiveLinkSourceToEIntegration<T>();
			if ((Context.OptionalIntegrations.Flags & EIntegrationToFlags(Integration)) == 0)
			{
				Errors.emplace_back(xrit_unreal::LiveLinkError{ xrit_unreal::LiveLinkErrorCode::PluginNotEnabled });
				return;
			}

			auto Settings = Arg.settings;

			auto& F = GetIntegration<Integration>(Integrations); // contains function pointers
			auto& Guid = OutUnrealGuid;
			if constexpr (Integration == EIntegration::LiveLinkDummy) { Guid = F.CreateLiveLinkDummySource(Client, Settings); }
			else if constexpr (Integration == EIntegration::LiveLinkMvn) { Guid = F.CreateLiveLinkMvnSource(Client, Settings); }
			else if constexpr (Integration == EIntegration::LiveLinkOptitrack) { Guid = F.CreateLiveLinkOptitrackSource(Client, Settings); }
			else if constexpr (Integration == EIntegration::LiveLinkXr) { Guid = F.CreateLiveLinkXrSource(Client, Settings); }
			else if constexpr (Integration == EIntegration::LiveLinkFreeD) { Guid = F.CreateLiveLinkFreeDSource(Client, Settings); }
			else
			{
				check(false);
			}

			SetLiveLinkSourceSettings(Context, Guid, Settings.base);

			UE_LOGFMT(XritModule, Display, "Created LiveLink Source {0}", GetLiveLinkSourceType<Type>().data());
		}
	}, Source);
	return Errors;
}

XritCommunication::LiveLinkErrors XritCommunication::UpdateLiveLinkSource(FXritContext& Context,
	xrit_unreal::LiveLinkSourceVariants const& Source, xrit_unreal::Guid UnrealId) {
	std::vector<xrit_unreal::LiveLinkError> Errors;

	std::visit([&]<typename T>(T && Arg)
	{
		using Type = std::decay_t<T>;
		if constexpr (std::is_same_v<Type, std::monostate>)
		{
			Errors.emplace_back(xrit_unreal::LiveLinkError{ xrit_unreal::LiveLinkErrorCode::InternalError });
		}
		else
		{
			// check if the integration is loaded
			// we separate this from each separate function call as each function calls this exact same check
			constexpr EIntegration Integration = LiveLinkSourceToEIntegration<T>();
			if ((Context.OptionalIntegrations.Flags & EIntegrationToFlags(Integration)) == 0)
			{
				Errors.emplace_back(xrit_unreal::LiveLinkError{ xrit_unreal::LiveLinkErrorCode::PluginNotEnabled });
				return;
			}

			auto Settings = Arg.settings;
			SetLiveLinkSourceSettings(Context, UnrealId, Settings.base);

			UE_LOGFMT(XritModule, Display, "Updated LiveLink Source {0}", GetLiveLinkSourceType<Type>().data());
		}
	}, Source);
	return Errors;
}

bool XritCommunication::LiveLinkCacheEntryIsValid(FXritContext& Context, xrit_unreal::LiveLinkSourceCacheEntry& Entry) {
	// get the source type string from the LiveLinkClient
	std::string const SourceType = XritConvert::ToStdString(Context.GetLiveLinkClient()->GetSourceType(XritConvert::ToFGuid(Entry.unrealGuid)));

	if (SourceType == InvalidLiveLinkSourceTypeString)
	{
		return false;
	}

	std::string_view const Expected = std::visit([&]<typename T>(T && Arg)
	{
		using Type = std::decay_t<T>;
		return GetLiveLinkSourceType<Type>();
	}, Entry.value);

	return SourceType == Expected;
}

void XritCommunication::UpdateLiveLinkSourceCacheEntry(FXritContext& Context, xrit_unreal::Guid NodeGuid,
	xrit_unreal::LiveLinkSourceCacheEntry& Entry) {
	// get base LiveLink source settings (shared by all sources, and can be changed after creating the source)
	ULiveLinkSourceSettings* SourceSettings = Context.GetLiveLinkClient()->GetSourceSettings(XritConvert::ToFGuid(Entry.unrealGuid));
	check(SourceSettings);

	// set the base
	xrit_unreal::LiveLinkSourceSettings BaseSettings = XritConvert::ToXritLiveLinkSourceSettings(*SourceSettings);

	// because these properties are shared between all sources, it is better to extract it out of the specific source types.
	std::visit([&]<typename T>(T && Arg)
	{
		using Type = std::decay_t<T>;
		if constexpr (!std::is_same_v<Type, std::monostate>)
		{
			check(Arg.id == NodeGuid);
			Arg.settings.base = BaseSettings;
		}
	}, Entry.value);

	// add subjects information
}

void XritCommunication::SendStatus(FXritContext& Context, xrit_unreal::WebSocket& Caller) {
	xrit_unreal::Configuration Status{};

	// cache entries to clear after iteration
	std::vector<xrit_unreal::Guid> CacheEntriesToErase;

	for (auto& Entry : Context.LiveLinkSourceCache.entries)
	{
		// check if the cache entry is still valid (i.e. the correct type and exists)
		if (!LiveLinkCacheEntryIsValid(Context, Entry.second))
		{
			CacheEntriesToErase.emplace_back(Entry.first);
			continue; // and don't add it to the status
		}

		// update the settings of the source
		UpdateLiveLinkSourceCacheEntry(Context, Entry.first, Entry.second);

		// populate the Status object with this source object (using copy)
		Status.livelink.sources.emplace_back(Entry.second.value);
	}

	// clear invalid cache entries
	for (auto& Entry : CacheEntriesToErase)
	{
		Context.LiveLinkSourceCache.entries.erase(Entry);
	}

	// serialize the status object and send to XR-IT Node
	std::stringstream Out;
	xrit_unreal::serialize(Status, Out);
	Caller.sendMessage(xrit_unreal::createNodeMessage(xrit_unreal::NodeCommand::status, Out.str()));
}

xrit_unreal::SetConfigurationResult XritCommunication::
SetConfiguration(FXritContext& Context, std::string const& Data) {
	xrit_unreal::SetConfigurationResult Result;
	UE_LOGFMT(XritModule, Display, "Set Configuration {0}", Data.c_str());

	// use simdjson for parsing the provided json
	simdjson::padded_string const PaddedJson = simdjson::padded_string{ Data };
	simdjson::ondemand::parser Parser;
	simdjson::ondemand::document JsonDocument;
	if (simdjson::error_code SimdjsonError = Parser.iterate(PaddedJson).get(JsonDocument); SimdjsonError != simdjson::SUCCESS)
	{
		Result.parse_errors.emplace_back(xrit_unreal::ParseError{ xrit_unreal::convert(SimdjsonError), {}, {}, simdjson::error_message(SimdjsonError) });
		return Result;
	}

	// parse configuration data (from json to the C++ struct `Configuration`)
	xrit_unreal::Configuration Configuration{};
	std::vector<xrit_unreal::ParseError> ParseErrors = xrit_unreal::parse(JsonDocument.get_value().value(), Configuration, "root");
	if (!ParseErrors.empty())
	{
		return Result;
	}

	// set udp unicast endpoint
	ConfigurationSetUdpUnicastEndpoint(Context, Configuration.udp_unicast_endpoint);

	// set livelink sources
	xrit_unreal::LiveLinkCallbacks const Callbacks{
		.removeSource = [&Context](xrit_unreal::Guid UnrealGuid)
		{
			return RemoveLiveLinkSource(Context, UnrealGuid);
		},
		.createSource = [&Context](xrit_unreal::LiveLinkSourceVariants const& Source, xrit_unreal::Guid& OutUnrealGuid)
		{
			return CreateLiveLinkSource(Context, Source, OutUnrealGuid);
		},
		.updateSource = [&Context](xrit_unreal::LiveLinkSourceVariants const& Source, xrit_unreal::Guid UnrealGuid)
		{
			return UpdateLiveLinkSource(Context, Source, UnrealGuid);
		}
	};
	Result.livelink_errors = xrit_unreal::setLiveLinkSources(Context.LiveLinkSourceCache, Configuration.livelink.sources, Callbacks);
	return Result;
}

void XritCommunication::SetConfigurationAsync(FXritContext& Context, xrit_unreal::WebSocket& Caller,
	std::string_view Data) {
	TPromise<xrit_unreal::SetConfigurationResult> Promise;
	TFuture<xrit_unreal::SetConfigurationResult> Future = Promise.GetFuture();

	// we run setting the configuration on the game thread
	// in addition, we copy the data to the lambda. Otherwise, the thread that has the Websocket connection will
	// destroy the string object the string view references before it gets used. 
	AsyncTask(ENamedThreads::GameThread, [&Context, Data = std::string(Data), &Promise]()
	{
		xrit_unreal::SetConfigurationResult const Result = SetConfiguration(Context, Data);
		Promise.SetValue(Result);
	});

	Future.Wait();
	check(Future.IsReady());

	// send the set_configuration_result message back
	xrit_unreal::SetConfigurationResult Result = Future.Get();
	std::stringstream Out;
	xrit_unreal::serialize(Result, Out);
	Caller.sendMessage(xrit_unreal::createNodeMessage(xrit_unreal::NodeCommand::set_configuration_result, Out.str()));
	SendStatus(Context, Caller);
}
