import {
  ULTRAGRID_RECEIVE_AUDIO_SETTINGS_NODE,
  ULTRAGRID_RECEIVE_AUDIO_STREAM_NODE,
  ULTRAGRID_RECEIVE_NODE,
  ULTRAGRID_RECEIVE_NODES_SIZE,
  ULTRAGRID_RECEIVE_VIDEO_SETTINGS_NODE,
  ULTRAGRID_RECEIVE_VIDEO_STREAM_NODE,
} from "./constants";
import { Edge, Node } from "@xyflow/react";
import { IServiceNodeData } from "@/types/diagram";
import { NEW_STREAM_HANDLE } from "@/core/handles/constants";
import {
  IUltragridReceiveConfiguration,
  IUltragridReceiveNodeData,
} from "./configuration";
import { BaseService } from "../BaseService";

class UltragridReceiveService extends BaseService {
  createNodes(
    config: IUltragridReceiveConfiguration,
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

    // Create new UltragridReceive node
    const nodeId: string = `${node.id}+${config.id}`;
    const newNode = this.createNode<IServiceNodeData>(
      nodeId,
      ULTRAGRID_RECEIVE_NODE,
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

    // Create new Video Settings node
    const videoSettingsNode = this.createChildNode<IUltragridReceiveNodeData>(
      `${nodeId}+VIDEO_SETTINGS`,
      nodeId,
      ULTRAGRID_RECEIVE_VIDEO_SETTINGS_NODE,
      {
        isOnline: true,
        label: "Video Settings",
        status: "existing",
        settings: {
          video_output: config.settings.video_output,
          audio_output: config.settings.audio_output,
        },
        stream_type: "VIDEO",
        software_id: "ULTRAGRID_RECEIVE",
      },
      node.is_online,
      {
        position: this.calculateNodePosition(
          0,
          false,
          ULTRAGRID_RECEIVE_NODES_SIZE,
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

    // Create Video Stream node
    const videoStreamNode = this.createChildNode<IUltragridReceiveNodeData>(
      `${nodeId}+VIDEO_STREAM`,
      nodeId,
      ULTRAGRID_RECEIVE_VIDEO_STREAM_NODE,
      {
        isOnline: true,
        label: "Video Stream",
        status: "new",
        settings: {
          video_output: config.settings.video_output,
          audio_output: config.settings.audio_output,
        },
        stream_type: "VIDEO",
        software_id: "ULTRAGRID_RECEIVE",
      },
      node.is_online,
      {
        position: this.calculateNodePosition(
          0,
          true,
          ULTRAGRID_RECEIVE_NODES_SIZE,
        ),
      },
    );
    videoStreamNode.data.input = this.createHandle(
      videoStreamNode.id,
      nodeId,
      "Video Stream",
      true,
      config.settings.video_output
        ? videoStreams[0]?.source.status ?? "SUCCESS"
        : "PENDING",
      NEW_STREAM_HANDLE,
      node.is_online && !!config.settings.video_output,
      videoStreams[0]?.source.errors,
    );
    videoStreamNode.data.output = this.createHandle(
      videoStreamNode.id,
      nodeId,
      "Video Stream",
      false,
      videoStreams[0]?.source.status ?? "SUCCESS",
      NEW_STREAM_HANDLE,
      node.is_online,
      videoStreams[0]?.source.errors,
    );

    const videoEdge: Edge = BaseService.createEdge(
      `${videoStreamNode.id}+${videoSettingsNode.id}`,
      BaseService.getEdgeType(
        node.is_online,
        videoStreamNode.data.output.status,
        videoSettingsNode.data.input.status,
      ),
      videoStreamNode.id,
      videoSettingsNode.id,
      videoStreamNode.data.output.id,
      videoSettingsNode.data.input.id,
    );
    edges.push(videoEdge);

    // Create Audio Settings node
    const audioSettingsNode = this.createChildNode<IUltragridReceiveNodeData>(
      `${nodeId}+AUDIO_SETTINGS`,
      nodeId,
      ULTRAGRID_RECEIVE_AUDIO_SETTINGS_NODE,
      {
        isOnline: true,
        label: "Audio Settings",
        status: "existing",
        settings: {
          video_output: config.settings.video_output,
          audio_output: config.settings.audio_output,
        },
        stream_type: "AUDIO",
        software_id: "ULTRAGRID_RECEIVE",
      },
      node.is_online,
      {
        position: this.calculateNodePosition(
          1,
          false,
          ULTRAGRID_RECEIVE_NODES_SIZE,
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
      node.is_online,
    );
    audioSettingsNode.data.output = this.createHandle(
      audioSettingsNode.id,
      nodeId,
      "Audio Settings",
      false,
      "SUCCESS",
      NEW_STREAM_HANDLE,
    );

    // Create Audio Stream node
    const audioStreamNode = this.createChildNode<IUltragridReceiveNodeData>(
      `${nodeId}+AUDIO_STREAM`,
      nodeId,
      ULTRAGRID_RECEIVE_AUDIO_STREAM_NODE,
      {
        isOnline: true,
        label: "Audio Stream",
        status: "new",
        settings: {
          video_output: config.settings.video_output,
          audio_output: config.settings.audio_output,
        },
        stream_type: "AUDIO",
        software_id: "ULTRAGRID_RECEIVE",
      },
      node.is_online,
      {
        position: this.calculateNodePosition(
          1,
          true,
          ULTRAGRID_RECEIVE_NODES_SIZE,
        ),
      },
    );
    audioStreamNode.data.input = this.createHandle(
      audioStreamNode.id,
      nodeId,
      "Audio Stream",
      true,
      config.settings.audio_output
        ? audioStreams[0]?.source.status ?? "SUCCESS"
        : "PENDING",
      NEW_STREAM_HANDLE,
      node.is_online && !!config.settings.audio_output,
      audioStreams[0]?.source.errors,
    );
    audioStreamNode.data.output = this.createHandle(
      audioStreamNode.id,
      nodeId,
      "Audio Stream",
      false,
      audioStreams[0]?.source.status ?? "SUCCESS",
      NEW_STREAM_HANDLE,
      node.is_online,
      audioStreams[0]?.source.errors,
    );

    const audioEdge = BaseService.createEdge(
      `${audioStreamNode.id}+${audioSettingsNode.id}`,
      BaseService.getEdgeType(
        node.is_online,
        audioStreamNode.data.output.status,
        audioSettingsNode.data.input.status,
      ),
      audioStreamNode.id,
      audioSettingsNode.id,
      audioStreamNode.data.output.id,
      audioSettingsNode.data.input.id,
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

export default new UltragridReceiveService();
