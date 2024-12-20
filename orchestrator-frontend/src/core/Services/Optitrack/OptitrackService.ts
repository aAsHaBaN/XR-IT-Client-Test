import {
  OPTITRACK_HARDWARE_NODE,
  OPTITRACK_NODE,
  OPTITRACK_STREAM_NODE,
} from "./constants";
import { Edge, Node } from "@xyflow/react";
import { NEW_STREAM_HANDLE, BASE_HANDLE } from "@/core/handles/constants";
import { IServiceNodeData, IStreamNodeData } from "@/types/diagram";
import { BaseService } from "../BaseService";

class OptitrackService extends BaseService {
  createNodes(
    config: IOptitrackConfiguration,
    node: INode,
    labs: { [key: string]: string },
    streams: IStream[],
  ): [Node[], Edge[]] {
    const edges: Edge[] = [];
    const nodes: Node[] = [];

    // Create new Optitrack node
    const nodeId: string = `${node.id}+${config.id}`;
    const newNode = this.createNode<IServiceNodeData>(
      nodeId,
      OPTITRACK_NODE,
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

    // Create new Stream node for new streams
    const newStreamNode = this.createOptitrackStreamNode(
      "New",
      nodeId,
      0,
      false,
    );
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
      const streamNode = this.createOptitrackStreamNode(
        stream.id,
        nodeId,
        index + 1,
        newNode.data.isOnline,
      );
      streamNode.data.input = this.createHandle(
        streamNode.id,
        nodeId,
        `Stream ${stream.target.entry_point.value}`,
        true,
        stream.source.status,
        BASE_HANDLE,
        false,
      );
      streamNode.data.output = this.createHandle(
        streamNode.id,
        nodeId,
        `Stream ${stream.target.entry_point.value}`,
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
            true,
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
      const hardwareNode = this.createChildNode<IStreamNodeData>(
        hardware.id,
        nodeId,
        OPTITRACK_HARDWARE_NODE,
        {
          isOnline: newNode.data.isOnline,
          label: hardware.hardware_id,
          status: "existing",
          software_id: "OPTITRACK",
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

  createOptitrackStreamNode(
    streamId: string,
    nodeId: string,
    index: number,
    isOnline: boolean,
  ): Node<IStreamNodeData> {
    const id: string = `${nodeId}+${streamId}`;

    return this.createChildNode<IStreamNodeData>(
      id,
      nodeId,
      OPTITRACK_STREAM_NODE,
      {
        isOnline,
        label: `Stream ${streamId}`,
        status: "existing",
        software_id: "OPTITRACK",
      },
      isOnline,
      {
        position: this.calculateNodePosition(index, false),
      },
    );
  }
}

const optitrackServiceInstance = new OptitrackService();
export default optitrackServiceInstance;
