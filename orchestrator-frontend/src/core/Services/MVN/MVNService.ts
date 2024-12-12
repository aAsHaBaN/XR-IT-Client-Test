import { MVN_NODE, MVN_STREAM_NODE, MVN_HARDWARE_NODE } from "./constants";
import { Edge, Node } from "@xyflow/react";
import { NEW_STREAM_HANDLE, BASE_HANDLE } from "@/core/handles/constants";
import { IServiceNodeData, IStreamNodeData } from "@/types/diagram";
import { BaseService } from "../BaseService";
import { CUSTOM_EDGE, OFFLINE_EDGE } from "@/core/edges/constants";

class MVNService extends BaseService {
  createNodes(
    config: IMVNConfiguration,
    node: INode,
    labs: { [key: string]: string },
    streams: IStream[],
  ): [Node[], Edge[]] {
    const edges: Edge[] = [];
    const nodes: Node[] = [];

    // Create new MVN node
    const nodeId: string = `${node.id}+${config.id}`;
    const newNode: Node<IServiceNodeData> = this.createNode<IServiceNodeData>(
      nodeId,
      MVN_NODE,
      {
        label: config.software_id,
        ip: node.local_ip,
        lab: labs[node.lab_id],
        machine: node.machine_alias,
        isOnline: node.is_online,
        status: config.status,
        port: config.settings.port,
        inputs: [],
        outputs: [],
        hasConnections: streams.length > 0,
        errors: config.errors,
        nodeErrors: node.errors,
      },
      node.is_online,
    );
    nodes.push(newNode);

    // Create new Stream node for new streams
    const newStreamNode = this.createMVNStreamNode("New", nodeId, 0, false);
    newStreamNode.data.output = this.createHandle(
      newStreamNode.id,
      nodeId,
      "New Stream",
      false,
      "SUCCESS",
      NEW_STREAM_HANDLE,
      newNode.data.isOnline,
    );
    newStreamNode.data.status = "new";
    newNode.data.outputs.push(newStreamNode.id);
    nodes.push(newStreamNode);

    const existingStreams = streams.filter(
      (stream) => stream.target.status !== "DELETED",
    );

    existingStreams.forEach((stream, index) => {
      // Create new Stream node for existing streams
      const streamNode = this.createMVNStreamNode(
        stream.id,
        nodeId,
        index + 1,
        newNode.data.isOnline,
      );
      streamNode.data.input = this.createHandle(
        streamNode.id,
        nodeId,
        `Stream ${index + 1}`,
        true,
        stream.source.status,
        BASE_HANDLE,
        false,
      );
      streamNode.data.output = this.createHandle(
        streamNode.id,
        nodeId,
        `Stream ${index + 1}`,
        false,
        stream.source.status,
        BASE_HANDLE,
        false,
        stream.source.errors,
      );
      newNode.data.outputs.push(streamNode.id);
      nodes.push(streamNode);

      config.settings.hardware.forEach((hardware) => {
        const newEdge = BaseService.createEdge(
          `${hardware.id}+${streamNode.id}`,
          BaseService.getEdgeType(
            newNode.data.isOnline,
            node.is_online ? "SUCCESS" : "OFFLINE",
            stream.source.status,
          ),
          hardware.id,
          streamNode.id,
          `${hardware.id}+output`,
          streamNode.data.input.id,
        );
        edges.push(newEdge);
      });
    });

    config.settings.hardware.forEach((hardware, index) => {
      const hardwareNode: Node<IStreamNodeData> =
        this.createChildNode<IStreamNodeData>(
          hardware.id,
          nodeId,
          MVN_HARDWARE_NODE,
          {
            isOnline: newNode.data.isOnline,
            label: hardware.hardware_id,
            status: "existing",
            software_id: "MVN",
          },
          newNode.data.isOnline,
          {
            position: this.calculateNodePosition(index, true),
          },
        );
      hardwareNode.data.input = this.createHandle(
        hardwareNode.id,
        nodeId,
        hardware.hardware_id,
        true,
        node.is_online ? "SUCCESS" : "OFFLINE",
        BASE_HANDLE,
        false,
      );
      hardwareNode.data.output = this.createHandle(
        hardwareNode.id,
        nodeId,
        hardware.hardware_id,
        false,
        node.is_online ? "SUCCESS" : "OFFLINE",
        BASE_HANDLE,
        false,
      );
      newNode.data.inputs.push(hardwareNode.id);
      nodes.push(hardwareNode);
    });

    return [nodes, edges];
  }

  createMVNStreamNode(
    streamId: string,
    nodeId: string,
    index: number,
    isOnline: boolean,
  ): Node<IStreamNodeData> {
    const id: string = `${nodeId}+${streamId}`;

    return this.createChildNode<IStreamNodeData>(
      id,
      nodeId,
      MVN_STREAM_NODE,
      {
        isOnline,
        label: `Stream ${streamId}`,
        status: "existing",
        software_id: "MVN",
      },
      isOnline,
      {
        position: this.calculateNodePosition(index, false),
      },
    );
  }
}

export default new MVNService();