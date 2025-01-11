import { type DiagramServiceInterface } from "@/types/diagram";
import { Edge, Node } from "@xyflow/react";
import { getInstance } from "@/core/Services/utils";
import { BASE_NODE } from "@/core/Services/constants";
import {
  EXTERNAL_EDGE,
  INTERNAL_EDGE,
  OFFLINE_EDGE,
} from "@/core/edges/constants";
import { BaseService } from "@/core/Services/BaseService";
import { EdgeType } from "@/core/edges/diagram";

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

  const labs: { [key: string]: string } = config.labs.reduce(
    function mapLabName(acc, lab) {
      return { ...acc, [lab.id]: lab.name };
    },
    {},
  );

  const allStreams: IStream[] = [...config.streams];
  config.pending_streams.forEach((stream) => {
    if (allStreams.find((s) => s.id === stream.id)) {
      return;
    }

    allStreams.push(stream);
  });

  config.nodes.forEach((node: INode) => {
    node.configurations.forEach((service) => {
      const [newNodes, newEdges] = getInstance(service.software_id).createNodes(
        service,
        node,
        labs,
        allStreams.filter(
          (stream) =>
            stream.source.configuration_id === service.id ||
            stream.target.configuration_id === service.id,
        ),
      );
      nodes.push(...newNodes);
      edges.push(...newEdges);
    });
  });

  const streamEdges: Edge[] = [];
  allStreams.forEach((stream) => {
    if (
      stream.source.status === "DELETED" &&
      stream.target.status === "DELETED"
    ) {
      return;
    }

    const sourceNode = nodes.find(
      (node) =>
        node.id ===
          `${stream.source.node_id}+${stream.source.configuration_id}` &&
        node.type !== BASE_NODE,
    );
    const targetNode = nodes.find(
      (node) =>
        node.id ===
          `${stream.target.node_id}+${stream.target.configuration_id}` &&
        node.type !== BASE_NODE,
    );

    if (!sourceNode || !targetNode) {
      return;
    }

    let edge;

    if (
      sourceNode.data.label === "ULTRAGRID_SEND" &&
      targetNode.data.label === "ULTRAGRID_RECEIVE"
    ) {
      const sourceHandle = `${stream.source.node_id}+${stream.source.configuration_id}+${stream.settings?.stream_type}_STREAM`;
      const targetHandle = `${stream.target.node_id}+${stream.target.configuration_id}+${stream.settings?.stream_type}_STREAM`;
      edge = defineEdge(
        stream,
        (sourceNode?.data?.isOnline as boolean) &&
          (targetNode?.data?.isOnline as boolean),
        sourceHandle,
        targetHandle,
        sourceHandle + "+output",
        targetHandle + "+input",
      );
    } else {
      edge = defineEdge(
        stream,
        (sourceNode?.data?.isOnline as boolean) &&
          (targetNode?.data?.isOnline as boolean),
      );
    }

    streamEdges.push(edge);
  });

  edges.push(...streamEdges);

  return { nodes, edges, labs: config.labs };
}

function defineEdge(
  stream: IStream,
  isNodeOnline: boolean,
  sourceId?: string,
  targetId?: string,
  sourceHandle?: string,
  targetHandle?: string,
): Edge {
  const type = BaseService.getEdgeType(
    isNodeOnline,
    stream.source.status,
    stream.target.status,
  );

  const edge = BaseService.createEdge(
    stream.id,
    type as EdgeType,
    sourceId ??
      `${stream.source.node_id}+${stream.source.configuration_id}+${stream.id}`,
    targetId ??
      `${stream.target.node_id}+${stream.target.configuration_id}+${stream.id}`,
    sourceHandle ??
      `${stream.source.node_id}+${stream.source.configuration_id}+${stream.id}+output`,
    targetHandle ??
      `${stream.target.node_id}+${stream.target.configuration_id}+${stream.id}+input`,
    {
      selectable: type === EXTERNAL_EDGE || type === OFFLINE_EDGE,
      animated: type === EXTERNAL_EDGE || type === INTERNAL_EDGE,
    },
  );

  return edge;
}

export default DiagramService;
