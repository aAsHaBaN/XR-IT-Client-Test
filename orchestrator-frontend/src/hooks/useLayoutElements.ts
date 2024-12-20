import { useCallback } from "react";
import ELK, { ElkNode } from "elkjs/lib/elk.bundled.js";
import { type Edge, type Node, useReactFlow } from "@xyflow/react";

type Algorithm = "layered" | "radial";
const elk = new ELK();

function buildElkNodes(nodes: string[], allNodes: Node[]) {
  return nodes.map((id) => {
    const node: Node | undefined = allNodes.find((node) => id === node.id);
    const result: ElkNode = {
      id,
      labels: [],
      children: [],
    };

    if (node?.data?.inputs) {
      result.children = result.children?.concat(
        buildElkNodes(node.data.inputs as string[], allNodes),
      );
    }

    if (node?.data?.outputs) {
      result.children = result.children?.concat(
        buildElkNodes(node.data.outputs as string[], allNodes),
      );
    }

    if (!node?.parentId) {
      const { width, height } = node?.measured || { width: 0, height: 0 };
      // Use label to force the size of the parent
      result.labels?.push({
        text: " ", // not used but a non-empty string is required
        width,
        height,
        x: 0,
        y: 0,
      });
    }

    return result;
  });
}

function getLayeredGraphLayout(nodes: Node[], edges: Edge[]) {
  const layoutOptions = {
    algorithm: "layered",
    "elk.direction": "RIGHT",
    "layered.nodePlacement.strategy": "SIMPLE",
    hierarchyHandling: "INCLUDE_CHILDREN",
    "spacing.nodeNode": "60",
    "layered.spacing.nodeNodeBetweenLayers": "100",
  };

  const rootNodes = nodes.reduce((acc: string[], n: Node) => {
    if (!n.parentId) acc.push(n.id);
    return acc;
  }, []);
  return {
    id: "root",
    layoutOptions,
    children: buildElkNodes(rootNodes, nodes),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };
}

function getRadialGraphLayout(nodes: Node[], edges: Edge[]) {
  const layoutOptions = {
    algorithm: "radial",
    "spacing.nodeNode": "70",
    "radial.compactor": "WEDGE_COMPACTION",
  };

  return {
    id: "root",
    layoutOptions,
    children: nodes.map(({ id, measured }) => {
      const result: ElkNode = {
        id,
        width: measured?.width,
        height: measured?.height,
      };

      return result;
    }),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };
}

function getGraphLayout(algorithm: Algorithm) {
  switch (algorithm) {
    case "layered":
      return getLayeredGraphLayout;
    case "radial":
      return getRadialGraphLayout;
    default:
      return getLayeredGraphLayout;
  }
}

async function getLayoutedNodes(
  nodes: Node[],
  edges: Edge[],
  algorithm: Algorithm,
) {
  const graph = getGraphLayout(algorithm)(nodes, edges);
  const layoutedGraph = await elk.layout(graph);

  function adjustPosition(elkNode: ElkNode) {
    const node: Node | undefined = nodes.find((n) => n.id === elkNode.id);
    if (!node) return null;

    const position = {
      x: elkNode.x ?? 0,
      y: elkNode.y ?? 0,
    };

    return {
      ...node,
      position: node.parentId ? node.position : position,
    };
  }

  return !layoutedGraph.children
    ? []
    : layoutedGraph.children.reduce((result: Node[], current: ElkNode) => {
        const node = adjustPosition(current);
        if (!node) return result;
        result.push(node);

        if (current.children) {
          current.children.forEach((child) => {
            const childNode = adjustPosition(child);
            if (!childNode) return;
            result.push(childNode);
          });
        }

        return result;
      }, []);
}

export default function useLayoutElements(algorithm: Algorithm = "layered") {
  const { getNodes, getEdges, setNodes, setEdges, fitView } =
    useReactFlow<Node>();

  const updateLayout = useCallback(async () => {
    const layoutedNodes = await getLayoutedNodes(
      getNodes(),
      getEdges(),
      algorithm,
    );

    setNodes(() => layoutedNodes.map((n) => ({ ...n, style: { opacity: 1 } })));
    setEdges(() => getEdges().map((e) => ({ ...e, style: { opacity: 1 } })));

    window.requestAnimationFrame(() => {
      fitView();
    });
  }, [getNodes, getEdges, setNodes, setEdges, fitView, algorithm]);

  return updateLayout;
}
