import { BaseService } from "../BaseService";
import {
  ULTRAGRID_SEND_AUDIO_SETTINGS_NODE,
  ULTRAGRID_SEND_AUDIO_STREAM_NODE,
  ULTRAGRID_SEND_NODE,
  ULTRAGRID_SEND_VIDEO_SETTINGS_NODE,
  ULTRAGRID_SEND_VIDEO_STREAM_NODE,
  ULTRAGRID_SEND_NODES_SIZE,
} from "./constants";
import { Edge, Node } from "@xyflow/react";
import { IServiceNodeData } from "@/types/diagram";
import { NEW_STREAM_HANDLE } from "@/core/handles/constants";
import {
  IUltragridSendAudioNodeData,
  IUltragridSendConfiguration,
  IUltragridSendNodeData,
  IUltragridSendVideoNodeData,
} from "./configuration";

function areAllVideoSettingsSet(
  settings: IUltragridSendVideoNodeData["videoSettings"],
): boolean {
  return (
    !!settings.source_name &&
    !!settings.resolution &&
    !!settings.compression &&
    !!settings.codec &&
    !!settings.frame_rate
  );
}

function areAllAudioSettingsSet(
  settings: IUltragridSendAudioNodeData["audioSettings"],
): boolean {
  return !!settings.source_name && !!settings.compression && !!settings.codec;
}

class UltragridSendService extends BaseService {
  createNodes(
    config: IUltragridSendConfiguration,
    node: INode,
    labs: { [key: string]: string },
    streams: IStream[],
  ): [Node[], Edge[]] {
    const edges: Edge[] = [];
    const nodes: Node[] = [];

    const videoStreams = streams.filter(
      (stream) => stream.settings?.stream_type === "VIDEO",
    );
    const audioStreams = streams.filter(
      (stream) => stream.settings?.stream_type === "AUDIO",
    );

    // Create new UltragridSend node
    const nodeId: string = `${node.id}+${config.id}`;
    const newNode = this.createNode<IServiceNodeData>(
      nodeId,
      ULTRAGRID_SEND_NODE,
      {
        label: config.software_id,
        ip: node.local_ip,
        lab: labs[node.lab_id],
        machine: node.machine_alias,
        isOnline: node.is_online,
        status: config.status,
        inputs: [],
        outputs: [],
        hasConnections: streams.length > 0,
        errors: config.errors,
        nodeErrors: node.errors,
      },
      node.is_online,
    );

    nodes.push(newNode);

    // Create Video Settings Node
    const videoSettingsNode = this.createChildNode<IUltragridSendNodeData>(
      `${nodeId}+VIDEO_SETTINGS`,
      nodeId,
      ULTRAGRID_SEND_VIDEO_SETTINGS_NODE,
      {
        isOnline: node.is_online,
        label: "Video Settings",
        status: "existing",
        software_id: "ULTRAGRID_SEND",
        settings: {
          video: config.settings.video,
          audio: config.settings.audio,
        },
      },
      node.is_online,
      {
        position: this.calculateNodePosition(
          0,
          true,
          ULTRAGRID_SEND_NODES_SIZE,
        ),
      },
    );

    videoSettingsNode.data.input = this.createHandle(
      videoSettingsNode.id,
      nodeId,
      "Video Settings",
      true,
      "SUCCESS",
      NEW_STREAM_HANDLE,
    );
    videoSettingsNode.data.output = this.createHandle(
      videoSettingsNode.id,
      nodeId,
      "Video Settings",
      false,
      "SUCCESS",
      NEW_STREAM_HANDLE,
    );

    // Create Video Stream Node
    const videoStreamNode = this.createChildNode<IUltragridSendNodeData>(
      `${nodeId}+VIDEO_STREAM`,
      nodeId,
      ULTRAGRID_SEND_VIDEO_STREAM_NODE,
      {
        isOnline: node.is_online,
        label: "Video Stream",
        status: "new",
        software_id: "ULTRAGRID_SEND",
        settings: {
          video: config.settings.video,
          audio: config.settings.audio,
        },
        stream_type: "VIDEO",
      },
      node.is_online,
      {
        position: this.calculateNodePosition(
          0,
          false,
          ULTRAGRID_SEND_NODES_SIZE,
        ),
      },
    );

    const isVideoSettingsSet = areAllVideoSettingsSet(config.settings.video);

    videoStreamNode.data.input = this.createHandle(
      videoStreamNode.id,
      nodeId,
      "Video Stream",
      true,
      videoStreams[0]?.source.status ?? "SUCCESS",
      NEW_STREAM_HANDLE,
      node.is_online,
      videoStreams[0]?.source.errors,
    );
    videoStreamNode.data.output = this.createHandle(
      videoStreamNode.id,
      nodeId,
      "Video Stream",
      false,
      isVideoSettingsSet
        ? videoStreams[0]?.source.status ?? "SUCCESS"
        : "PENDING",
      NEW_STREAM_HANDLE,
      node.is_online && isVideoSettingsSet,
      videoStreams[0]?.source.errors,
    );

    const videoEdge: Edge = BaseService.createEdge(
      `${videoSettingsNode.id}+${videoStreamNode.id}`,
      BaseService.getEdgeType(
        node.is_online,
        videoSettingsNode.data.output.status,
        videoStreamNode.data.input.status,
        true,
      ),
      videoSettingsNode.id,
      videoStreamNode.id,
      videoSettingsNode.data.output.id,
      videoStreamNode.data.input.id,
    );
    edges.push(videoEdge);

    // Create Audio Settings Node
    const audioSettingsNode = this.createChildNode<IUltragridSendNodeData>(
      `${nodeId}+AUDIO_SETTINGS`,
      nodeId,
      ULTRAGRID_SEND_AUDIO_SETTINGS_NODE,
      {
        isOnline: node.is_online,
        label: "Audio Settings",
        status: "existing",
        software_id: "ULTRAGRID_SEND",
        settings: {
          video: config.settings.video,
          audio: config.settings.audio,
        },
      },
      node.is_online,
      {
        position: this.calculateNodePosition(
          1,
          true,
          ULTRAGRID_SEND_NODES_SIZE,
        ),
      },
    );

    audioSettingsNode.data.input = this.createHandle(
      audioSettingsNode.id,
      nodeId,
      "Audio Settings",
      true,
      "SUCCESS",
      NEW_STREAM_HANDLE,
    );
    audioSettingsNode.data.output = this.createHandle(
      audioSettingsNode.id,
      nodeId,
      "Audio Settings",
      false,
      "SUCCESS",
      NEW_STREAM_HANDLE,
    );

    // Create Audio Stream Node
    const audioStreamNode = this.createChildNode<IUltragridSendNodeData>(
      `${nodeId}+AUDIO_STREAM`,
      nodeId,
      ULTRAGRID_SEND_AUDIO_STREAM_NODE,
      {
        isOnline: node.is_online,
        label: "Audio Stream",
        status: "new",
        software_id: "ULTRAGRID_SEND",
        settings: {
          video: config.settings.video,
          audio: config.settings.audio,
        },
        stream_type: "AUDIO",
      },
      node.is_online,
      {
        position: this.calculateNodePosition(
          1,
          false,
          ULTRAGRID_SEND_NODES_SIZE,
        ),
      },
    );

    const isAudioSettingsSet = areAllAudioSettingsSet(config.settings.audio);

    audioStreamNode.data.input = this.createHandle(
      audioStreamNode.id,
      nodeId,
      "Audio Stream",
      true,
      audioStreams[0]?.source.status ?? "SUCCESS",
      NEW_STREAM_HANDLE,
      node.is_online,
      audioStreams[0]?.source.errors,
    );
    audioStreamNode.data.output = this.createHandle(
      audioStreamNode.id,
      nodeId,
      "Audio Stream",
      false,
      isAudioSettingsSet
        ? audioStreams[0]?.source.status ?? "SUCCESS"
        : "PENDING",
      NEW_STREAM_HANDLE,
      node.is_online && isAudioSettingsSet,
      audioStreams[0]?.source.errors,
    );

    const audioEdge: Edge = BaseService.createEdge(
      `${audioSettingsNode.id}+${audioStreamNode.id}`,
      BaseService.getEdgeType(
        node.is_online,
        audioSettingsNode.data.output.status,
        audioStreamNode.data.input.status,
        true,
      ),
      audioSettingsNode.id,
      audioStreamNode.id,
      audioSettingsNode.data.output.id,
      audioStreamNode.data.input.id,
    );
    edges.push(audioEdge);

    newNode.data.inputs.push(videoSettingsNode.id);
    nodes.push(videoSettingsNode);
    newNode.data.outputs.push(videoStreamNode.id);
    nodes.push(videoStreamNode);
    newNode.data.inputs.push(audioSettingsNode.id);
    nodes.push(audioSettingsNode);
    newNode.data.outputs.push(audioStreamNode.id);
    nodes.push(audioStreamNode);

    return [nodes, edges];
  }
}

const ultragridSendServiceInstance = new UltragridSendService();
export default ultragridSendServiceInstance;
