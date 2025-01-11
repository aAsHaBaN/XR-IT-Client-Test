#pragma once

#include "LiveLinkSourceSettings.h"
#include "xrit_unreal/data/guid.h"
#include "xrit_unreal/data/livelink.h"

namespace XritConvert
{
    // type conversion (made inline to avoid having a DLL dependency)
    
    [[nodiscard]] inline FGuid ToFGuid(xrit_unreal::Guid const Value)
    {
        return FGuid(Value.a, Value.b, Value.c, Value.d);
    }

    [[nodiscard]] inline xrit_unreal::Guid ToXritGuid(FGuid const Value)
    {
        return xrit_unreal::Guid{Value.A, Value.B, Value.C, Value.D};
    }
    
    [[nodiscard]] inline FString ToFString(std::string_view const Value)
    {
        std::string const String(Value);
        return FString(String.c_str());
    }
    
    [[nodiscard]] inline std::string ToStdString(FString const& Value)
    {
        return std::string(TCHAR_TO_UTF8(*Value));
    }

    [[nodiscard]] inline std::string ToStdString(FText const& Value)
    {
        return ToStdString(Value.ToString());
    }
    
    [[nodiscard]] inline xrit_unreal::LiveLinkSourceMode ToXritLiveLinkSourceMode(ELiveLinkSourceMode const Value)
    {
        switch (Value)
        {
        case ELiveLinkSourceMode::Latest: return xrit_unreal::LiveLinkSourceMode::Latest;
        case ELiveLinkSourceMode::EngineTime: return xrit_unreal::LiveLinkSourceMode::EngineTime;
        case ELiveLinkSourceMode::Timecode: return xrit_unreal::LiveLinkSourceMode::Timecode;
        default: return xrit_unreal::LiveLinkSourceMode::Invalid;
        }
    }

    [[nodiscard]] inline ELiveLinkSourceMode ToELiveLinkSourceMode(xrit_unreal::LiveLinkSourceMode const Value)
    {
        switch (Value)
        {
        case xrit_unreal::LiveLinkSourceMode::Latest: return ELiveLinkSourceMode::Latest;
        case xrit_unreal::LiveLinkSourceMode::EngineTime: return ELiveLinkSourceMode::EngineTime;
        case xrit_unreal::LiveLinkSourceMode::Timecode: return ELiveLinkSourceMode::Timecode;
        default:
            {
                check(false);
                return ELiveLinkSourceMode::EngineTime;
            } 
        }
    }

    [[nodiscard]] inline xrit_unreal::Framerate ToXritFramerate(FFrameRate const& Value)
    {
        xrit_unreal::Framerate Out;
        Out.denominator = Value.Denominator;
        Out.numerator = Value.Numerator;
        return Out;
    }

    [[nodiscard]] inline FFrameRate ToFFramerate(xrit_unreal::Framerate const& Value)
    {
        FFrameRate Out;
        Out.Denominator = Value.denominator;
        Out.Numerator = Value.numerator;
        return Out;
    }

    [[nodiscard]] inline xrit_unreal::LiveLinkSourceBufferManagementSettings ToXritLiveLinkSourceBufferManagementSettings(FLiveLinkSourceBufferManagementSettings const& Value)
    {
        xrit_unreal::LiveLinkSourceBufferManagementSettings Out;
        Out.valid_engine_time_enabled = Value.bValidEngineTimeEnabled;
        Out.valid_engine_time = Value.ValidEngineTime;
        Out.engine_time_offset = Value.EngineTimeOffset;
        Out.generate_sub_frame = Value.bGenerateSubFrame;
        Out.use_timecode_smooth_latest = Value.bUseTimecodeSmoothLatest;
        Out.source_timecode_framerate = ToXritFramerate(Value.SourceTimecodeFrameRate);
        Out.valid_timecode_frame_enabled = Value.bValidTimecodeFrameEnabled;
        Out.valid_timecode_frame = Value.ValidTimecodeFrame;
        Out.timecode_frame_offset = Value.TimecodeFrameOffset;
        Out.latest_offset = Value.LatestOffset;
        Out.max_number_of_frames_to_buffer = Value.MaxNumberOfFrameToBuffered;
        Out.keep_at_least_one_frame = Value.bKeepAtLeastOneFrame;
        return Out;
    }

    [[nodiscard]] inline xrit_unreal::LiveLinkSourceSettings ToXritLiveLinkSourceSettings(ULiveLinkSourceSettings const& Value)
    {
        xrit_unreal::LiveLinkSourceSettings Out;
        Out.mode = ToXritLiveLinkSourceMode(Value.Mode);
        Out.buffer_settings = ToXritLiveLinkSourceBufferManagementSettings(Value.BufferSettings);
        return Out;
    }
}
