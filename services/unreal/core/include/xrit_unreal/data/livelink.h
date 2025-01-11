#ifndef XRIT_UNREAL_DATA_LIVELINK_H
#define XRIT_UNREAL_DATA_LIVELINK_H

#include "../reflect/reflect.h"

#include "../guid.h"

namespace xrit_unreal
{
REFLECT_ENUM

enum class LiveLinkSourceMode
{
    Invalid,
    Latest,
    EngineTime,
    Timecode,
    Count
};

REFLECT_STRUCT

struct Framerate
{
    uint64_t REFLECT(numerator) = 24;
    uint64_t REFLECT(denominator) = 1;
};

REFLECT_STRUCT

struct LiveLinkSourceBufferManagementSettings
{
    bool REFLECT(valid_engine_time_enabled) = false; // Enabled the valid_engine_time setting.
    float REFLECT(valid_engine_time) =
        1.0f; // If the frame is older than ValidTime, remove it from the buffer list (in seconds).
    float REFLECT(engine_time_offset) =
        0.0f; // When evaluating with time: how far back from current time should we read the buffer (in seconds)
    bool REFLECT(generate_sub_frame) = false;
    bool REFLECT(use_timecode_smooth_latest) =
        false; // When evaluating with timecode, align source timecode using a continuous clock offset to do a smooth
    // latest. This means that even if engine Timecode and source Timecode are not aligned, the offset
    // between both clocks will be tracked to keep them aligned. With an additionnal offset, 1.5 is a good
    // number, you can evaluate your subject using the latest frame by keeping just enough margin to have a
    // smooth playback and avoid starving.
    Framerate REFLECT(source_timecode_framerate); // What is the source frame rate. When the refresh rate of the source
    // is bigger than the timecode frame rate, LiveLink will try to
    // generate sub frame numbers. The source should generate the sub
    // frame numbers. Use this setting when the source is not able to do
    // so. The generated sub frame numbers will not be saved by Sequencer.
    bool REFLECT(valid_timecode_frame_enabled) = false; // If the frame timecode is older than ValidTimecodeFrame,
    // remove it from the buffer list (in TimecodeFrameRate).
    int64_t REFLECT(valid_timecode_frame) = 30; // If the frame timecode is older than ValidTimecodeFrame, remove it
    // from the buffer list (in TimecodeFrameRate).
    float REFLECT(timecode_frame_offset) = 0; // When evaluating with timecode: how far back from current timecode
    // should we read the buffer (in TimecodeFrameRate).
    int64_t REFLECT(latest_offset) =
        0; // When evaluating with latest: how far back from latest frame should we read the buffer
    int64_t REFLECT(max_number_of_frames_to_buffer) = 10; // Maximum number of frame to keep in memory.
    bool REFLECT(keep_at_least_one_frame) =
        true; // When cleaning the buffer keep at least one frame, even if the frame doesn't matches the other options.
};

REFLECT_STRUCT

struct LiveLinkSourceSettings
{
    LiveLinkSourceMode REFLECT(mode) = LiveLinkSourceMode::EngineTime;
    LiveLinkSourceBufferManagementSettings REFLECT(buffer_settings);
};

REFLECT_STRUCT

struct LiveLinkDummySourceSettings
{
    std::string_view REFLECT(ip_address);
    int64_t REFLECT(port);
    LiveLinkSourceSettings REFLECT(base);
};

REFLECT_STRUCT

struct LiveLinkMvnSourceSettings
{
    int64_t REFLECT(port);
    LiveLinkSourceSettings REFLECT(base);
};

REFLECT_STRUCT

struct LiveLinkOptitrackSourceSettings
{
    std::string_view REFLECT(server_address);
    std::string_view REFLECT(client_address);
    bool REFLECT(is_multicast);
    LiveLinkSourceSettings REFLECT(base);
};

REFLECT_STRUCT

struct LiveLinkXrSourceSettings
{
    bool REFLECT(track_trackers) = true;
    bool REFLECT(track_controllers) = false;
    bool REFLECT(track_hmds) = false;
    uint64_t REFLECT(local_update_rate_in_hz) = 60;
    LiveLinkSourceSettings REFLECT(base);
};

REFLECT_STRUCT

struct VirtualSubjectSourceSettings
{
    LiveLinkSourceSettings base;
};

REFLECT_ENUM

enum class FreeDDefaultConfigs
{
    Invalid,
    None,
    Generic,
    Panasonic,
    Sony,
    stYpe,
    Mosys,
    Ncam,
    Count
};

REFLECT_STRUCT

struct FreeDEncoderData
{
    bool REFLECT(is_valid) = false;         // Is this encoder data valid?
    bool REFLECT(invert_encoder) = false;   // Invert the encoder input direction
    bool REFLECT(use_manual_range) = false; // Use manual Min/Max values for the encoder normalization (normally uses
    // dynamic auto ranging based on inputs)
    int64_t REFLECT(min) = 16777215;       // Minimum raw encoder value (0x00FFFFFF)
    int64_t REFLECT(max) = 0;              // Maximum raw encoder value
    int64_t REFLECT(mask_bits) = 16777215; // Mask bits for raw encoder value (0x00FFFFFF)
};

REFLECT_STRUCT

struct LiveLinkFreeDSourceSettings
{
    std::string_view REFLECT(ip_address) = "127.0.0.1"; // IP address of the free-d tracking source
    uint64_t REFLECT(udp_port) = 40000;                 // UDP port number
    LiveLinkSourceSettings REFLECT(base);
    bool REFLECT(send_extra_metadata) = false; // Send extra string metadata (Camera ID and FrameCounter)
    FreeDDefaultConfigs REFLECT(default_config) =
        FreeDDefaultConfigs::None; // Default configurations for specific manufacturers
    FreeDEncoderData REFLECT(
        focus_distance_encoder_data){}; // Raw focus distance (in cm) encoder parameters for this camera - 24 bits max
    FreeDEncoderData REFLECT(
        focal_length_encoder_data){}; // Raw focal length/zoom (in mm) encoder parameters for this camera - 24 bits max
    FreeDEncoderData REFLECT(user_defined_encoder_data){}; // Raw user defined/spare data encoder (normally used for
    // Aperture) parameters for this camera - 16 bits max
};

REFLECT_STRUCT

struct LiveLinkMessageBusSourceSettings
{
    std::string_view REFLECT(source_type);
    std::string_view REFLECT(machine_name);
    Guid REFLECT(address);
    LiveLinkSourceSettings REFLECT(base);
};

REFLECT_STRUCT

struct LiveLinkDummySource
{
    Guid REFLECT(id);
    LiveLinkDummySourceSettings REFLECT(settings);
    std::vector<uint64_t> REFLECT(subjects);
};

REFLECT_STRUCT

struct LiveLinkMvnSource
{
    Guid REFLECT(id);
    LiveLinkMvnSourceSettings REFLECT(settings);
    std::vector<uint64_t> REFLECT(subjects);
};

REFLECT_STRUCT

struct LiveLinkOptitrackSource
{
    Guid REFLECT(id);
    LiveLinkOptitrackSourceSettings REFLECT(settings);
    std::vector<uint64_t> REFLECT(subjects);
};

REFLECT_STRUCT

struct LiveLinkXrSource
{
    Guid REFLECT(id);
    LiveLinkXrSourceSettings REFLECT(settings);
    std::vector<uint64_t> REFLECT(subjects);
};

REFLECT_STRUCT

struct VirtualSubjectSource
{
    Guid REFLECT(id);
    VirtualSubjectSourceSettings REFLECT(settings);
    std::vector<uint64_t> REFLECT(subjects);
};

REFLECT_STRUCT

struct LiveLinkFreeDSource
{
    Guid REFLECT(id);
    LiveLinkFreeDSourceSettings REFLECT(settings);
    std::vector<uint64_t> REFLECT(subjects);
};

REFLECT_STRUCT

struct LiveLinkMessageBusSource
{
    Guid REFLECT(id);
    LiveLinkMessageBusSourceSettings REFLECT(settings);
    std::vector<uint64_t> REFLECT(subjects);
};

using LiveLinkSourceVariants =
    std::variant<std::monostate, LiveLinkDummySource, LiveLinkMvnSource, LiveLinkOptitrackSource, LiveLinkXrSource,
                 VirtualSubjectSource, LiveLinkFreeDSource, LiveLinkMessageBusSource>;

REFLECT_STRUCT

struct LiveLink
{
    std::vector<LiveLinkSourceVariants> REFLECT(sources);
};

REFLECT_ENUM

enum class LiveLinkErrorCode
{
    Invalid,
    InternalError,    // if this happens, there is a bug in the plugin
    PluginNotEnabled, // the LiveLink plugin (e.g. LiveLinkMvnPlugin) is not enabled in Unreal. We could automate
    // enabling this.
    Unimplemented,      // the creation logic for the source type is not implemented yet
    SourceDoesNotExist, // the source does not exist (anymore), this can happen when updating or removing a source
    Count
};

REFLECT_STRUCT

struct LiveLinkError
{
    LiveLinkErrorCode REFLECT(code);
    Guid REFLECT(sourceId); // node id of the source that failed
};
} // namespace xrit_unreal

#include "livelink_generated.h"

#endif // XRIT_UNREAL_DATA_LIVELINK_H