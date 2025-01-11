import { LAB_NODE } from "./constants";
import { Edge, Node } from "@xyflow/react";

interface LabServiceInterface {
  createNodes(lab: ILab, machines: INode[]): [Node[], Edge[]];
}

const LabService: LabServiceInterface = {
  createNodes(lab: ILab, machines: INode[]): [Node[], Edge[]] {
    const edges: Edge[] = [];
    const nodes: Node[] = [];

    const formattedMachines = machines.map((machine) => ({
      id: machine.id,
      ip: machine.local_ip,
      name: machine.machine_alias,
      isOnline: machine.is_online,
      services: machine.configurations.map((config) => ({
        software: config.software_id,
        status: config.status,
        errors: config.errors || [],
        id: config.id,
      })),
      errors: machine.errors || [],
    }));

    // Create new Lab node
    const newNode: Node<ILabNodeData> = {
      id: lab.id,
      type: LAB_NODE,
      data: {
        label: lab.name,
        machines: formattedMachines,
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

export default LabService;
