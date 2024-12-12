import NodeService, { NodeServiceInterface } from "./NodeService";
import MVNService from "./MVN/MVNService";
import OptitrackService from "./Optitrack/OptitrackService";
import UnrealService from "./Unreal/UnrealService";
import MetaquestService from "./Metaquest/MetaquestService";
import { MVN_HARDWARE_NODE, MVN_NODE, MVN_STREAM_NODE } from "./MVN/constants";
import { LIVELINK_NODE, SCENE_NODE, UNREAL_NODE } from "./Unreal/constants";
import {
  OPTITRACK_HARDWARE_NODE,
  OPTITRACK_NODE,
  OPTITRACK_STREAM_NODE,
} from "./Optitrack/constants";
import {
  METAQUEST_HARDWARE_NODE,
  METAQUEST_NODE,
  METAQUEST_STREAM_NODE,
} from "./Metaquest/constants";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";
import type { TailwindConfig } from "@/../tailwind-config";
import UltragridSendService from "./UltragridSend/UltragridSendService";
import {
  ULTRAGRID_SEND_AUDIO_SETTINGS_NODE,
  ULTRAGRID_SEND_AUDIO_STREAM_NODE,
  ULTRAGRID_SEND_NODE,
  ULTRAGRID_SEND_VIDEO_SETTINGS_NODE,
  ULTRAGRID_SEND_VIDEO_STREAM_NODE,
} from "./UltragridSend/constants";
import UltragridReceiveService from "./UltragridReceive/UltragridReceiveService";
import {
  ULTRAGRID_RECEIVE_AUDIO_SETTINGS_NODE,
  ULTRAGRID_RECEIVE_AUDIO_STREAM_NODE,
  ULTRAGRID_RECEIVE_NODE,
  ULTRAGRID_RECEIVE_VIDEO_SETTINGS_NODE,
  ULTRAGRID_RECEIVE_VIDEO_STREAM_NODE,
} from "./UltragridReceive/constants";

export function getInstance(software: ISoftware): NodeServiceInterface {
  switch (software) {
    case "MVN":
      return MVNService;
    case "OPTITRACK":
      return OptitrackService;
    case "UNREAL_ENGINE":
      return UnrealService;
    case "METAQUEST":
      return MetaquestService;
    case "ULTRAGRID_SEND":
      return UltragridSendService;
    case "ULTRAGRID_RECEIVE":
      return UltragridReceiveService;
    default:
      return NodeService;
  }
}

export function getNodeColor(type: string) {
  const tailwind = resolveConfig<TailwindConfig>(
    tailwindConfig as TailwindConfig,
  );

  switch (type) {
    case MVN_NODE:
      return tailwind.theme.colors["mvn"]["primary"];
    case MVN_STREAM_NODE:
    case MVN_HARDWARE_NODE:
      return tailwind.theme.colors["mvn"]["secondary"];
    case UNREAL_NODE:
      return tailwind.theme.colors["unreal"]["primary"];
    case LIVELINK_NODE:
    case SCENE_NODE:
      return tailwind.theme.colors["unreal"]["secondary"];
    case OPTITRACK_NODE:
      return tailwind.theme.colors["optitrack"]["primary"];
    case OPTITRACK_HARDWARE_NODE:
    case OPTITRACK_STREAM_NODE:
      return tailwind.theme.colors["optitrack"]["secondary"];
    case METAQUEST_NODE:
      return tailwind.theme.colors["metaquest"]["primary"];
    case METAQUEST_HARDWARE_NODE:
    case METAQUEST_STREAM_NODE:
      return tailwind.theme.colors["metaquest"]["secondary"];
    case ULTRAGRID_SEND_NODE:
      return tailwind.theme.colors["ultragrid-send"]["primary"];
    case ULTRAGRID_SEND_VIDEO_SETTINGS_NODE:
    case ULTRAGRID_SEND_VIDEO_STREAM_NODE:
    case ULTRAGRID_SEND_AUDIO_SETTINGS_NODE:
    case ULTRAGRID_SEND_AUDIO_STREAM_NODE:
      return tailwind.theme.colors["ultragrid-send"]["secondary"];
    case ULTRAGRID_RECEIVE_NODE:
      return tailwind.theme.colors["ultragrid-receive"]["primary"];
    case ULTRAGRID_RECEIVE_VIDEO_SETTINGS_NODE:
    case ULTRAGRID_RECEIVE_VIDEO_STREAM_NODE:
    case ULTRAGRID_RECEIVE_AUDIO_SETTINGS_NODE:
    case ULTRAGRID_RECEIVE_AUDIO_STREAM_NODE:
      return tailwind.theme.colors["ultragrid-receive"]["secondary"];
    default:
      return tailwind.theme.colors["base"]["primary"];
  }
}

export function formatServiceName(name: string) {
  return name
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
