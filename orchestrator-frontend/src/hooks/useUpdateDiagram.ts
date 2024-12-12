import {
  Edge,
  Node,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { useEffect } from "react";
import { type Dispatch, type SetStateAction } from "react";

function useUpdateDiagram(
  configNodes: Node[],
  configEdges: Edge[],
  setNodes: Dispatch<SetStateAction<Node[]>>,
  setEdges: Dispatch<SetStateAction<Edge[]>>,
  isFirstLoad: boolean,
) {
  const { getNodes, updateNodeData, getEdges } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    setNodes((currentNodes: Node[]) => {
      return configNodes.map((node: Node) => {
        const oldNode = currentNodes.find((n) => n.id === node.id);
        const newNode = oldNode
          ? {
              ...oldNode,
              data: node.data,
            }
          : node;

        if (node.parentId) {
          newNode.position = node.position;
        }

        // on first load, keep nodes hidden until layout is done
        if (!isFirstLoad) {
          newNode.style = { opacity: 1 };
        }

        return newNode;
      });
    });
  }, [
    configNodes,
    getNodes,
    setNodes,
    updateNodeData,
    updateNodeInternals,
    isFirstLoad,
  ]);

  useEffect(() => {
    setEdges((currentEdges: Edge[]) => {
      return configEdges.map((edge: Edge) => {
        const oldEdge = currentEdges.find((e) => e.id === edge.id);
        const newEdge = oldEdge
          ? {
              ...oldEdge,
              type: edge.type,
              data: edge.data,
            }
          : edge;

        // on first load, keep edges hidden until layout is done
        if (!isFirstLoad) {
          newEdge.style = { opacity: 1 };
        }

        return newEdge;
      });
    });
  }, [configEdges, getEdges, setEdges, isFirstLoad]);
}

export default useUpdateDiagram;
