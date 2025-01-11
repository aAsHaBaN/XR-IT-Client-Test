import { IStreamNodeData } from "@/types/diagram";

interface IUltragridSendConfiguration extends INodeConfiguration {
  software_id: "ULTRAGRID_SEND";
  settings: IUltragridSendSettings;
}

type IUltragridSendSettings = {
  video: IUltragridSendVideoNodeData["videoSettings"];
  audio: IUltragridSendAudioNodeData["audioSettings"];
};

export type UltragridVideoResolution =
  | "3840 x 2160 (4k UHD)"
  | "2560 x 1440 (2k)"
  | "1920 x 1080 (1080p HD)"
  | "1280 x 720 (720p HD)"
  | "640 x 480 (SD)";
export type UltragridVideoCompression =
  | "1 Mbps"
  | "2 Mbps"
  | "4 Mbps"
  | "8 Mbps"
  | "16 Mbps"
  | "32 Mbps";
export type UltragridVideoFrameRate =
  | "60"
  | "59.97 (60i)"
  | "48"
  | "30"
  | "29.97 (30i)"
  | "25"
  | "24.97 (25i)"
  | "24"
  | "23.98 (24i)";
export type UltragridVideoCodec = "H264" | "H265 (HEVC)" | "MJPEG";
export type UltragridAudioCompression =
  | "16 Kbps"
  | "32 Kbps"
  | "64 Kbps"
  | "128 Kbps"
  | "256 Kbps";
export type UltragridAudioCodec = "AAC" | "MP3";

interface IUltragridSendNodeData extends IStreamNodeData {
  settings: {
    video: IUltragridSendVideoNodeData;
    audio: IUltragridSendAudioNodeData;
  };
}

interface IUltragridSendVideoNodeData extends IStreamNodeData {
  source_name?: string;
  resolution?: UltragridVideoResolution;
  compression?: UltragridVideoCompression;
  codec?: UltragridVideoCodec;
  frame_rate?: UltragridVideoFrameRate;
}

interface IUltragridSendAudioNodeData extends IStreamNodeData {
  source_name?: string;
  compression?: UltragridAudioCompression;
  codec?: UltragridAudioCodec;
}
