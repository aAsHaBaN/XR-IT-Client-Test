import { IServiceNodeData } from "@/types/diagram";
import { Edge, Node } from "@xyflow/react";
import { BASE_NODE } from "./constants";

export interface NodeServiceInterface {
  createNodes(
    config: INodeConfiguration,
    node: INode,
    labs: { [key: string]: string },
    streams: IStream[],
  ): [Node[], Edge[]];
}

const NodeService: NodeServiceInterface = {
  createNodes: (
    config: INodeConfiguration,
    node: INode,
    labs: { [key: string]: string },
    streams: IStream[],
  ): [Node[], Edge[]] => {
    const edges: Edge[] = [];
    const nodes: Node[] = [];

    const nodeId: string = `${node.id}+${config.id}`;
    const newNode: Node<IServiceNodeData> = {
      id: nodeId,
      type: BASE_NODE,
      data: {
        label: config.software_id,
        ip: node.local_ip,
        lab: labs[node.lab_id],
        machine: node.machine_alias,
        isOnline: node.is_online,
        status: config.status,
        inputs: [],
        outputs: [],
        hasConnections: streams.length > 0,
      },
      position: { x: 0, y: 0 },
      deletable: false,
      style: {
        opacity: 0,
      },
    };
    nodes.push(newNode);

    return [nodes, edges];
  },
};

export default NodeService;
