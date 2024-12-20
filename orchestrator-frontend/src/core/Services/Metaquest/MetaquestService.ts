import { BaseService } from "../BaseService";
import {
  METAQUEST_HARDWARE_NODE,
  METAQUEST_NODE,
  METAQUEST_STREAM_NODE,
} from "./constants";
import { Edge, Node } from "@xyflow/react";
import { NEW_STREAM_HANDLE, BASE_HANDLE } from "@/core/handles/constants";
import { IServiceNodeData, IStreamNodeData } from "@/types/diagram";

class MetaquestService extends BaseService {
  createNodes(
    config: IMetaquestConfiguration,
    node: INode,
    labs: { [key: string]: string },
    streams: IStream[],
  ): [Node[], Edge[]] {
    const edges: Edge[] = [];
    const nodes: Node[] = [];

    // Create new Metaquest node
    const nodeId: string = `${node.id}+${config.id}`;
    const newNode = this.createNode<IServiceNodeData>(
      nodeId,
      METAQUEST_NODE,
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

    // Create hardware node
    const hardwareNode = this.createChildNode<IStreamNodeData>(
      `${node.id}+hardware`,
      nodeId,
      METAQUEST_HARDWARE_NODE,
      {
        isOnline: newNode.data.isOnline,
        label: "HEADSET",
        status: "existing",
        software_id: config.software_id,
      },
      false,
      {
        draggable: false,
        position: this.calculateNodePosition(0, true),
      },
    );

    const hardwareInput = this.createHandle(
      hardwareNode.id,
      nodeId,
      hardwareNode.data.label,
      true,
      node.is_online ? "SUCCESS" : "OFFLINE",
      BASE_HANDLE,
    );
    const hardwareOutput = this.createHandle(
      hardwareNode.id,
      nodeId,
      hardwareNode.data.label,
      false,
      node.is_online ? "SUCCESS" : "OFFLINE",
      BASE_HANDLE,
    );

    hardwareNode.data.input = hardwareInput;
    hardwareNode.data.output = hardwareOutput;
    newNode.data.inputs.push(hardwareNode.id);
    nodes.push(hardwareNode);

    if (streams.length === 0) {
      // Create new Stream node for new streams
      const newStream = this.createMetaquestStreamNode(
        "New",
        nodeId,
        0,
        newNode.data.isOnline,
      );
      newStream.data.status = "new";
      newStream.data.output = this.createHandle(
        newStream.id,
        nodeId,
        "New Stream",
        false,
        "SUCCESS",
        NEW_STREAM_HANDLE,
        newNode.data.isOnline,
      );
      newNode.data.outputs.push(newStream.id);
      nodes.push(newStream);
    } else {
      streams.forEach((stream, index) => {
        // Create new Stream node for existing streams
        const streamNode = this.createMetaquestStreamNode(
          stream.id,
          nodeId,
          index,
          newNode.data.isOnline,
        );
        streamNode.data.input = this.createHandle(
          streamNode.id,
          nodeId,
          "Stream",
          true,
          stream.source.status,
          BASE_HANDLE,
        );
        streamNode.data.output = this.createHandle(
          streamNode.id,
          nodeId,
          "Stream",
          false,
          stream.source.status,
          BASE_HANDLE,
          false,
          stream.source.errors,
        );

        newNode.data.outputs.push(streamNode.id);
        nodes.push(streamNode);

        const newEdge = BaseService.createEdge(
          `${hardwareNode.id}+${streamNode.id}`,
          BaseService.getEdgeType(
            newNode.data.isOnline,
            node.is_online ? "SUCCESS" : "OFFLINE",
            stream.source.status,
            true,
          ),
          hardwareNode.id,
          streamNode.id,
          hardwareNode.data.output.id,
          streamNode.data.input.id,
        );
        edges.push(newEdge);
      });
    }

    return [nodes, edges];
  }

  createMetaquestStreamNode(
    streamId: string,
    nodeId: string,
    index: number,
    isOnline: boolean,
  ): Node<IStreamNodeData> {
    const id: string = `${nodeId}+${streamId}`;

    return this.createChildNode<IStreamNodeData>(
      id,
      nodeId,
      METAQUEST_STREAM_NODE,
      {
        isOnline,
        label: `Stream ${streamId}`,
        status: "existing",
        software_id: "METAQUEST",
      },
      isOnline,
      {
        position: this.calculateNodePosition(index, false),
      },
    );
  }
}

const metaquestServiceInstance = new MetaquestService();
export default metaquestServiceInstance;
