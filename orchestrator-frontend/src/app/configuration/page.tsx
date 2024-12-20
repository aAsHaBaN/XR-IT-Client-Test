"use client";

import Flow from "./_components/Flow";
import useConfig from "@/hooks/useConfig";
import { Edge, Node, Panel, ReactFlowProvider } from "@xyflow/react";
import useNodePlacement from "@/hooks/useNodePlacement";
import DiagramService from "./_services/DiagramService";
import Sidebar from "./_components/Sidebar";
import { useCallback, useMemo } from "react";
import GlobalErrors from "@/components/GlobalErrors";
import NoConfigurationAlert from "@/components/NoConfigurationAlert";
import useSocket from "@/hooks/useSocket";

function Home() {
  const { isConnected } = useSocket();
  const { nodes, edges, setNodes, labs, configurationName, errors } =
    useConfig(DiagramService);
  const [nodePlacement, setNodePlacement] = useNodePlacement(nodes);

  const sidebarNodes = useMemo(
    () => nodes.filter((node) => nodePlacement[node.id] === "sidebar"),
    [nodes, nodePlacement],
  );

  const mainNodes: Node[] = useMemo(
    () =>
      nodes.filter(
        (node) =>
          nodePlacement[node.id] !== "sidebar" ||
          (node.parentId && nodePlacement[node.parentId] !== "sidebar"),
      ),
    [nodes, nodePlacement],
  );

  const mainEdges: Edge[] = useMemo(
    () =>
      edges.filter(
        (edge) =>
          mainNodes.find((node) => node.id === edge.source) &&
          mainNodes.find((node) => node.id === edge.target),
      ),
    [edges, mainNodes],
  );

  const moveNodeToPane = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      setNodePlacement((prevPlacement) => ({
        ...prevPlacement,
        [nodeId]: "main",
      }));
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId ? { ...node, position } : node,
        ),
      );
    },
    [setNodes, setNodePlacement],
  );

  return (
    <>
      <Sidebar nodes={sidebarNodes} labs={labs} />
      <div className="h-full w-full pl-52">
        <ReactFlowProvider>
          <Flow
            configNodes={mainNodes}
            configEdges={mainEdges}
            dropNode={moveNodeToPane}
            configurationName={configurationName}
          >
            <Panel position="top-left">
              <div className="flex items-center gap-2 font-bold text-secondary">
                <span>{configurationName}</span>
              </div>
            </Panel>
            <Panel position="top-center">
              {isConnected ? (
                <GlobalErrors errors={errors} />
              ) : (
                <NoConfigurationAlert />
              )}
            </Panel>
          </Flow>
        </ReactFlowProvider>
      </div>
    </>
  );
}

export default Home;
