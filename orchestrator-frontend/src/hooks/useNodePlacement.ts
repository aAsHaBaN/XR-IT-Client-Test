import { type Node } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";

type NodePlacement = "sidebar" | "main";

function useNodePlacement(
  nodes: Node[],
): [
  { [nodeId: string]: NodePlacement },
  React.Dispatch<React.SetStateAction<{ [nodeId: string]: NodePlacement }>>,
] {
  const [nodePlacement, setNodePlacement] = useState<{
    [nodeId: string]: NodePlacement;
  }>({});

  const updateNodePlacement = useCallback(() => {
    setNodePlacement((prevPlacement) => {
      const newPlacement: { [nodeId: string]: NodePlacement } = {};
      nodes.forEach((node) => {
        newPlacement[node.id] =
          node.data.hasConnections || prevPlacement[node.id] === "main"
            ? "main"
            : "sidebar";
      });
      return newPlacement;
    });
  }, [nodes]);

  useEffect(() => {
    updateNodePlacement();
  }, [updateNodePlacement]);

  return [nodePlacement, setNodePlacement];
}

export default useNodePlacement;
