import { ORCHESTRATOR_NODE } from "./constants";
import { Edge, Node } from "@xyflow/react";

interface OrchestratorServiceInterface {
  createNodes(name: string, id: string): [Node[], Edge[]];
}

const OrchestratorService: OrchestratorServiceInterface = {
  createNodes(name: string, id: string): [Node[], Edge[]] {
    const edges: Edge[] = [];
    const nodes: Node[] = [];

    // Create new Orchestrator node
    const newNode: Node<IOrchestratorNodeData> = {
      id,
      type: ORCHESTRATOR_NODE,
      data: {
        label: "XR-IT Orchestrator",
        configName: name,
        isOnline: true,
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

export default OrchestratorService;
