import { Edge, Node } from "@xyflow/react";
import OrchestratorService from "@/core/Orchestrator/OrchestratorService";
import LabService from "@/core/Lab/LabService";
import { DiagramServiceInterface } from "@/types/diagram";
import { INTERNAL_EDGE } from "@/core/edges/constants";

const DiagramService: DiagramServiceInterface = {
  generateDiagram,
};

function generateDiagram(config: IConfiguration): {
  nodes: Node[];
  edges: Edge[];
  labs: ILab[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const [newNodes, newEdges] = OrchestratorService.createNodes(
    config.configuration_name,
    config.id,
    config.nodes.find((n) => n.role === "orchestrator")?.local_ip ?? "",
  );
  nodes.push(...newNodes);
  edges.push(...newEdges);

  config.labs.forEach((lab: ILab) => {
    const [newNodes, newEdges] = LabService.createNodes(
      lab,
      config.nodes.filter((n) => n.lab_id === lab.id),
    );
    nodes.push(...newNodes);
    edges.push(...newEdges);

    const connection: Edge = {
      id: `${config.id}+${lab.id}`,
      source: config.id,
      target: lab.id,
      type: INTERNAL_EDGE,
      selectable: false,
      deletable: false,
      style: {
        opacity: 0,
      },
    };

    edges.push(connection);
  });

  return { nodes, edges, labs: config.labs };
}

export default DiagramService;
