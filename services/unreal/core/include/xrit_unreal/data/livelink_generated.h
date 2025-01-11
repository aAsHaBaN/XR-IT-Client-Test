// -----------------------------------------------------------
// automatically generated with scripts/generate_reflection.py
// don't edit this file directly.
// -----------------------------------------------------------

REFLECT_IMPL_STRUCT_BEGIN (xrit_unreal::Framerate)
REFLECT_IMPL_FIELD (numerator)
REFLECT_IMPL_FIELD (denominator)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkSourceBufferManagementSettings)
REFLECT_IMPL_FIELD (valid_engine_time_enabled)
REFLECT_IMPL_FIELD (valid_engine_time)
REFLECT_IMPL_FIELD (engine_time_offset)
REFLECT_IMPL_FIELD (generate_sub_frame)
REFLECT_IMPL_FIELD (use_timecode_smooth_latest)
REFLECT_IMPL_FIELD (source_timecode_framerate)
REFLECT_IMPL_FIELD (valid_timecode_frame_enabled)
REFLECT_IMPL_FIELD (valid_timecode_frame)
REFLECT_IMPL_FIELD (timecode_frame_offset)
REFLECT_IMPL_FIELD (latest_offset)
REFLECT_IMPL_FIELD (max_number_of_frames_to_buffer)
REFLECT_IMPL_FIELD (keep_at_least_one_frame)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkSourceSettings)
REFLECT_IMPL_FIELD (mode)
REFLECT_IMPL_FIELD (buffer_settings)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkDummySourceSettings)
REFLECT_IMPL_FIELD (ip_address)
REFLECT_IMPL_FIELD (port)
REFLECT_IMPL_FIELD (base)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkMvnSourceSettings)
REFLECT_IMPL_FIELD (port)
REFLECT_IMPL_FIELD (base)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkOptitrackSourceSettings)
REFLECT_IMPL_FIELD (server_address)
REFLECT_IMPL_FIELD (client_address)
REFLECT_IMPL_FIELD (is_multicast)
REFLECT_IMPL_FIELD (base)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkXrSourceSettings)
REFLECT_IMPL_FIELD (track_trackers)
REFLECT_IMPL_FIELD (track_controllers)
REFLECT_IMPL_FIELD (track_hmds)
REFLECT_IMPL_FIELD (local_update_rate_in_hz)
REFLECT_IMPL_FIELD (base)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::VirtualSubjectSourceSettings)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::FreeDEncoderData)
REFLECT_IMPL_FIELD (is_valid)
REFLECT_IMPL_FIELD (invert_encoder)
REFLECT_IMPL_FIELD (use_manual_range)
REFLECT_IMPL_FIELD (min)
REFLECT_IMPL_FIELD (max)
REFLECT_IMPL_FIELD (mask_bits)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkFreeDSourceSettings)
REFLECT_IMPL_FIELD (ip_address)
REFLECT_IMPL_FIELD (udp_port)
REFLECT_IMPL_FIELD (base)
REFLECT_IMPL_FIELD (send_extra_metadata)
REFLECT_IMPL_FIELD (default_config)
REFLECT_IMPL_FIELD (focus_distance_encoder_data)
REFLECT_IMPL_FIELD (focal_length_encoder_data)
REFLECT_IMPL_FIELD (user_defined_encoder_data)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkMessageBusSourceSettings)
REFLECT_IMPL_FIELD (source_type)
REFLECT_IMPL_FIELD (machine_name)
REFLECT_IMPL_FIELD (address)
REFLECT_IMPL_FIELD (base)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkDummySource)
REFLECT_IMPL_FIELD (id)
REFLECT_IMPL_FIELD (settings)
REFLECT_IMPL_FIELD (subjects)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkMvnSource)
REFLECT_IMPL_FIELD (id)
REFLECT_IMPL_FIELD (settings)
REFLECT_IMPL_FIELD (subjects)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkOptitrackSource)
REFLECT_IMPL_FIELD (id)
REFLECT_IMPL_FIELD (settings)
REFLECT_IMPL_FIELD (subjects)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkXrSource)
REFLECT_IMPL_FIELD (id)
REFLECT_IMPL_FIELD (settings)
REFLECT_IMPL_FIELD (subjects)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::VirtualSubjectSource)
REFLECT_IMPL_FIELD (id)
REFLECT_IMPL_FIELD (settings)
REFLECT_IMPL_FIELD (subjects)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkFreeDSource)
REFLECT_IMPL_FIELD (id)
REFLECT_IMPL_FIELD (settings)
REFLECT_IMPL_FIELD (subjects)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkMessageBusSource)
REFLECT_IMPL_FIELD (id)
REFLECT_IMPL_FIELD (settings)
REFLECT_IMPL_FIELD (subjects)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLink)
REFLECT_IMPL_FIELD (sources)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_STRUCT_BEGIN(xrit_unreal::LiveLinkError)
REFLECT_IMPL_FIELD (code)
REFLECT_IMPL_FIELD (sourceId)
REFLECT_IMPL_STRUCT_END

REFLECT_IMPL_ENUM_BEGIN(xrit_unreal::LiveLinkSourceMode)
REFLECT_IMPL_CASE (Latest)
REFLECT_IMPL_CASE (EngineTime)
REFLECT_IMPL_CASE (Timecode)
REFLECT_IMPL_ENUM_END

REFLECT_IMPL_ENUM_BEGIN(xrit_unreal::FreeDDefaultConfigs)
REFLECT_IMPL_CASE (None)
REFLECT_IMPL_CASE (Generic)
REFLECT_IMPL_CASE (Panasonic)
REFLECT_IMPL_CASE (Sony)
REFLECT_IMPL_CASE (stYpe)
REFLECT_IMPL_CASE (Mosys)
REFLECT_IMPL_CASE (Ncam)
REFLECT_IMPL_ENUM_END

REFLECT_IMPL_ENUM_BEGIN(xrit_unreal::LiveLinkErrorCode)
REFLECT_IMPL_CASE (InternalError)
REFLECT_IMPL_CASE (PluginNotEnabled)
REFLECT_IMPL_CASE (Unimplemented)
REFLECT_IMPL_CASE (SourceDoesNotExist)
REFLECT_IMPL_ENUM_END

