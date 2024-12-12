import { EdgeTypes, NodeTypes } from "@xyflow/react";
import {
  CUSTOM_EDGE,
  ERROR_EDGE,
  OFFLINE_EDGE,
  PENDING_EDGE,
} from "@/core/edges/constants";
import { PendingEdge, CustomEdge, ErrorEdge } from "@/core/edges";
import {
  MVN_NODE,
  MVN_STREAM_NODE,
  MVN_HARDWARE_NODE,
} from "@/core/Services/MVN/constants";
import { MVNNode, MVNStreamNode, MVNHardwareNode } from "@/core/Services/MVN";
import {
  LIVELINK_NODE,
  UNREAL_NODE,
  SCENE_NODE,
} from "@/core/Services/Unreal/constants";
import { UnrealNode, LiveLinkNode, SceneNode } from "@/core/Services/Unreal";
import {
  OPTITRACK_NODE,
  OPTITRACK_STREAM_NODE,
  OPTITRACK_HARDWARE_NODE,
} from "@/core/Services/Optitrack/constants";
import {
  OptitrackNode,
  OptitrackStreamNode,
  OptitrackHardwareNode,
} from "@/core/Services/Optitrack";
import {
  METAQUEST_HARDWARE_NODE,
  METAQUEST_NODE,
  METAQUEST_STREAM_NODE,
} from "@/core/Services/Metaquest/constants";
import {
  MetaquestNode,
  MetaquestHardwareNode,
  MetaquestStreamNode,
} from "@/core/Services/Metaquest";
import {
  ULTRAGRID_SEND_NODE,
  ULTRAGRID_SEND_VIDEO_SETTINGS_NODE,
  ULTRAGRID_SEND_VIDEO_STREAM_NODE,
  ULTRAGRID_SEND_AUDIO_SETTINGS_NODE,
  ULTRAGRID_SEND_AUDIO_STREAM_NODE,
} from "./UltragridSend/constants";
import {
  UltragridSendNode,
  UltragridSendVideoSettingsNode,
  UltragridSendVideoStreamNode,
  UltragridSendAudioSettingsNode,
  UltragridSendAudioStreamNode,
} from "./UltragridSend";
import {
  ULTRAGRID_RECEIVE_NODE,
  ULTRAGRID_RECEIVE_VIDEO_SETTINGS_NODE,
  ULTRAGRID_RECEIVE_VIDEO_STREAM_NODE,
  ULTRAGRID_RECEIVE_AUDIO_SETTINGS_NODE,
  ULTRAGRID_RECEIVE_AUDIO_STREAM_NODE,
} from "./UltragridReceive/constants";
import {
  UltragridReceiveNode,
  UltragridReceiveVideoSettingsNode,
  UltragridReceiveVideoStreamNode,
  UltragridReceiveAudioSettingsNode,
  UltragridReceiveAudioStreamNode,
} from "./UltragridReceive";

import { BaseNode } from "./BaseNode";
import { INodeSize } from "./configuration";
import OfflineEdge from "../edges/OfflineEdge";
export const BASE_NODE = "base-node";

export const NODE_TYPES_MAP: NodeTypes = {
  [MVN_NODE]: MVNNode,
  [MVN_STREAM_NODE]: MVNStreamNode,
  [MVN_HARDWARE_NODE]: MVNHardwareNode,
  [UNREAL_NODE]: UnrealNode,
  [LIVELINK_NODE]: LiveLinkNode,
  [SCENE_NODE]: SceneNode,
  [OPTITRACK_NODE]: OptitrackNode,
  [OPTITRACK_STREAM_NODE]: OptitrackStreamNode,
  [OPTITRACK_HARDWARE_NODE]: OptitrackHardwareNode,
  [METAQUEST_NODE]: MetaquestNode,
  [METAQUEST_HARDWARE_NODE]: MetaquestHardwareNode,
  [METAQUEST_STREAM_NODE]: MetaquestStreamNode,
  [ULTRAGRID_SEND_NODE]: UltragridSendNode,
  [ULTRAGRID_SEND_VIDEO_SETTINGS_NODE]: UltragridSendVideoSettingsNode,
  [ULTRAGRID_SEND_VIDEO_STREAM_NODE]: UltragridSendVideoStreamNode,
  [ULTRAGRID_SEND_AUDIO_SETTINGS_NODE]: UltragridSendAudioSettingsNode,
  [ULTRAGRID_SEND_AUDIO_STREAM_NODE]: UltragridSendAudioStreamNode,
  [ULTRAGRID_RECEIVE_NODE]: UltragridReceiveNode,
  [ULTRAGRID_RECEIVE_VIDEO_SETTINGS_NODE]: UltragridReceiveVideoSettingsNode,
  [ULTRAGRID_RECEIVE_VIDEO_STREAM_NODE]: UltragridReceiveVideoStreamNode,
  [ULTRAGRID_RECEIVE_AUDIO_SETTINGS_NODE]: UltragridReceiveAudioSettingsNode,
  [ULTRAGRID_RECEIVE_AUDIO_STREAM_NODE]: UltragridReceiveAudioStreamNode,
  [BASE_NODE]: BaseNode,
};

export const SERVICES = [
  MVN_NODE,
  UNREAL_NODE,
  OPTITRACK_NODE,
  METAQUEST_NODE,
  ULTRAGRID_SEND_NODE,
  ULTRAGRID_RECEIVE_NODE,
  BASE_NODE,
];

export const SERVICE_TYPES_MAP: { [key: string]: any } = {
  [MVN_NODE]: MVNNode,
  [UNREAL_NODE]: UnrealNode,
  [OPTITRACK_NODE]: OptitrackNode,
  [METAQUEST_NODE]: MetaquestNode,
  [ULTRAGRID_SEND_NODE]: UltragridSendNode,
  [ULTRAGRID_RECEIVE_NODE]: UltragridReceiveNode,
  [BASE_NODE]: BaseNode,
};

export const EDGE_TYPES_MAP: EdgeTypes = {
  [CUSTOM_EDGE]: CustomEdge,
  [PENDING_EDGE]: PendingEdge,
  [ERROR_EDGE]: ErrorEdge,
  [OFFLINE_EDGE]: OfflineEdge,
};

export const COLORS_MAP: { [key in ISoftware]: string } = {
  UNREAL_ENGINE: "unreal",
  MVN: "mvn",
  OPTITRACK: "optitrack",
  METAQUEST: "metaquest",
  ULTRAGRID_SEND: "ultragrid-send",
  ULTRAGRID_RECEIVE: "ultragrid-receive",
};

export const SERVICE_NODES_SIZE: INodeSize = {
  parentWidth: 448, // 28em
  parentHeader: 96, // h-24
  width: 144, // w-36
  height: 32, // h-16
  border: 2, // border-2
  gap: 4, // gap-1
};
