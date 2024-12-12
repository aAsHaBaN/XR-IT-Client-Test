import { LIVELINK_NODE, UNREAL_NODE, SCENE_NODE } from "./constants";
import { Edge, Node } from "@xyflow/react";
import { NEW_STREAM_HANDLE, BASE_HANDLE } from "@/core/handles/constants";
import { IServiceNodeData, IStreamNodeData } from "@/types/diagram";
import PortManager from "@/services/ports";
import { BaseService } from "../BaseService";

class UnrealService extends BaseService {
  createNodes(
    config: IUnrealConfiguration,
    node: INode,
    labs: { [key: string]: string },
    streams: IStream[],
  ): [Node[], Edge[]] {
    const edges: Edge[] = [];
    const nodes: Node[] = [];

    // Create new Unreal node
    const nodeId: string = `${node.id}+${config.id}`;
    const newNode = this.createNode<IServiceNodeData>(
      nodeId,
      UNREAL_NODE,
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

    // Create new LiveLink node for new streams
    const newStreamNode = this.createLiveLinkNode("New", nodeId, 0, false);
    newStreamNode.data.status = "new";

    newStreamNode.data.input = this.createHandle(
      newStreamNode.id,
      nodeId,
      "New Port",
      true,
      "SUCCESS",
      NEW_STREAM_HANDLE,
      true,
    );
    newNode.data.inputs.push(newStreamNode.id);
    nodes.push(newStreamNode);

    // Create a scene node
    const sceneNode = this.createChildNode<IStreamNodeData>(
      nodeId + "+scene",
      nodeId,
      SCENE_NODE,
      {
        status: "new",
        isOnline: newNode.data.isOnline,
        label: "Scene",
        software_id: "UNREAL_ENGINE",
      },
      newNode.data.isOnline,
      {
        position: this.calculateNodePosition(0),
      },
    );
    sceneNode.data.input = this.createHandle(
      sceneNode.id,
      nodeId,
      "Scene",
      true,
      "SUCCESS",
      BASE_HANDLE,
      false,
    );
    newNode.data.outputs.push(sceneNode.id);
    nodes.push(sceneNode);

    const deletedStreams = streams.filter(
      (stream) => stream.target.status === "DELETED",
    );
    deletedStreams.forEach((stream) => {
      const portManager = PortManager.getInstance();
      portManager.releasePort(
        stream.target.configuration_id,
        stream.target.entry_point.value as number,
      );
    });

    const existingStreams = streams.filter(
      (stream) => stream.target.status !== "DELETED",
    );

    existingStreams.forEach((stream, index) => {
      // Create new LiveLink node for each existing stream
      const streamNode = this.createLiveLinkNode(
        stream.id,
        nodeId,
        index + 1,
        newNode.data.isOnline,
      );

      if (stream.target.status === "SUCCESS") {
        const portManager = PortManager.getInstance();
        portManager.assignPort(
          config.id,
          stream.target.entry_point.value as number,
        );
      }

      streamNode.data.input = this.createHandle(
        streamNode.id,
        nodeId,
        "Port " + stream.target.entry_point.value,
        true,
        stream.target.status,
        BASE_HANDLE,
        false,
        stream.target.errors,
      );
      streamNode.data.output = this.createHandle(
        streamNode.id,
        nodeId,
        "Port " + stream.target.entry_point.value,
        false,
        stream.target.status,
        BASE_HANDLE,
        false,
      );
      newNode.data.inputs.push(streamNode.id);
      nodes.push(streamNode);

      const newEdge = BaseService.createEdge(
        `${stream.id}+scene`,
        BaseService.getEdgeType(
          newNode.data.isOnline,
          stream.target.status,
          sceneNode.data.input.status,
        ),
        streamNode.id,
        sceneNode.id,
        streamNode.data.output.id,
        sceneNode.data.input.id,
      );
      edges.push(newEdge);
    });

    return [nodes, edges];
  }

  createLiveLinkNode(
    streamId: string,
    nodeId: string,
    index: number,
    isOnline: boolean,
  ): Node<IStreamNodeData> {
    const id: string = `${nodeId}+${streamId}`;

    return this.createChildNode<IStreamNodeData>(
      id,
      nodeId,
      LIVELINK_NODE,
      {
        isOnline,
        label: `Stream ${streamId}`,
        status: "existing",
        software_id: "UNREAL_ENGINE",
      },
      isOnline,
      {
        position: this.calculateNodePosition(index, true),
      },
    );
  }
}

export default new UnrealService();
