// Supported UltraGrid video resolutions in XR-IT
export type UltraGridResolution =
  | "3840 x 2160 (4k UHD)"
  | "2560 x 1440 (2k)"
  | "1920 x 1080 (1080p HD)"
  | "1280 x 720 (720p HD)"
  | "640 x 480 (SD)";

// Supported UltraGrid video compression levels in XR-IT
export type UltraGridVideoCompression =
  | "1 Mbps"
  | "2 Mbps"
  | "4 Mbps"
  | "8 Mbps"
  | "16 Mbps"
  | "32 Mbps";

// Supported UltraGrid video frame rates in XR-IT
export type UltraGridVideoFrameRate =
  | "60"
  | "59.97 (60i)"
  | "48"
  | "30"
  | "29.97 (30i)"
  | "25"
  | "24.97 (25i)"
  | "24"
  | "23.98 (24i)";

// Supported UltraGrid video codecs in XR-IT
export type UltraGridVideoCodec = "H264" | "H265 (HEVC)" | "MJPEG";

// Supported UltraGrid audio compression levels in XR-IT
export type UltraGridAudioCompression =
  | "16 Kbps"
  | "32 Kbps"
  | "64 Kbps"
  | "128 Kbps"
  | "256 Kbps";

// Supported UltraGrid audio codecs in XR-IT
export type UltraGridAudioCodec = "AAC" | "MP3";

export interface UltraGridSendVideoSettings {
  source_name: string | undefined;
  resolution: UltraGridResolution | undefined;
  compression: UltraGridVideoCompression | undefined;
  frame_rate: UltraGridVideoFrameRate | undefined;
  codec: UltraGridVideoCodec | undefined;
}

export interface UltraGridSendAudioSettings {
  source_name: string | undefined;
  compression: UltraGridAudioCompression | undefined;
  codec: UltraGridAudioCodec | undefined;
}

export class UltraGridSend {
  public video: UltraGridSendVideoSettings;
  public audio: UltraGridSendAudioSettings;

  constructor(
    video_source?: string,
    video_resolution?: UltraGridResolution,
    video_compression?: UltraGridVideoCompression,
    video_frame_rate?: UltraGridVideoFrameRate,
    video_codec?: UltraGridVideoCodec,
    audio_source?: string,
    audio_compression?: UltraGridAudioCompression,
    audio_codec?: UltraGridAudioCodec
  ) {
    this.video = {
      source_name: video_source ? video_source : undefined,
      resolution: video_resolution ? video_resolution : undefined,
      compression: video_compression ? video_compression : undefined,
      frame_rate: video_frame_rate ? video_frame_rate : undefined,
      codec: video_codec ? video_codec : undefined,
    };

    this.audio = {
      source_name: audio_source ? audio_source : undefined,
      compression: audio_compression ? audio_compression : undefined,
      codec: audio_codec ? audio_codec : undefined,
    };
  }

  static serialize(settings: UltraGridSend) {
    return structuredClone(settings);
  }
}

export class UltraGridReceive {
  video_output: string | undefined;
  audio_output: string | undefined;

  constructor(video_output?: string, audio_output?: string) {
    this.video_output = video_output;
    this.audio_output = audio_output;
  }

  static serialize(settings: UltraGridReceive) {
    return structuredClone(settings);
  }
}

// Given that UltraGrid can stream video, audio or both we need to determine the
// type of stream being sent from a device. In this case, even if we are streaming
// audio AND video from a UltraGrid instance, we treat them as individual streams.
export class UltraGridStreamSettings {
  constructor(public stream_type: "VIDEO" | "AUDIO") { }

  static serialize(settings: UltraGridStreamSettings) {
    return { stream_type: settings.stream_type }
  }
}
