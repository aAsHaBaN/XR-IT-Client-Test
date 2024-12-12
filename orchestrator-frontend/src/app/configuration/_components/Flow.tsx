"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type Node,
  type Edge,
  type OnConnect,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  useReactFlow,
  ControlButton,
  useNodesInitialized,
  Panel,
} from "@xyflow/react";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import useLayoutElements from "@/hooks/useLayoutElements";
import { EDGE_TYPES_MAP, NODE_TYPES_MAP } from "@/core/Services/constants";
import { createEdge } from "@/services/config";
import { checkConnection, saveConfiguration } from "@/services/config";
import { PENDING_EDGE } from "@/core/edges/constants";
import { IServiceNodeData, IStreamNodeData } from "@/types/diagram";
import useUpdateDiagram from "@/hooks/useUpdateDiagram";
import { getNodeColor } from "@/core/Services/utils";
import GlobalErrors from "@/components/GlobalErrors";
import SaveButton from "@/components/SaveButton";

type IFlowProps = {
  configNodes: Node[];
  configEdges: Edge[];
  dropNode: (nodeId: string, position: { x: number; y: number }) => void;
  configurationName: string;
  errors: IError[];
};

function Flow({
  configNodes,
  configEdges,
  dropNode,
  configurationName,
  errors,
}: IFlowProps) {
  const { getNode, screenToFlowPosition, fitView, zoomTo } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(configNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(configEdges);
  const [firstLoad, setFirstLoad] = useState(true);

  const updateLayout = useLayoutElements();
  const nodesInitialized = useNodesInitialized();

  const nodeColor = useCallback(
    (node: Node) => {
      return getNodeColor(node.type ?? "");
    },
    [getNodeColor],
  );

  useUpdateDiagram(configNodes, configEdges, setNodes, setEdges, firstLoad);

  useEffect(() => {
    if (nodesInitialized && firstLoad) {
      setFirstLoad(false);
      updateLayout().then(() => {
        fitView();
        zoomTo(1);
      });
    }
  }, [nodesInitialized, updateLayout, firstLoad]);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const targetSubnode = getNode(connection.target) as Node<IStreamNodeData>;
      const sourceSubnode = getNode(connection.source) as Node<IStreamNodeData>;

      createEdge(sourceSubnode, targetSubnode);
      const edge = { ...connection, type: PENDING_EDGE };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges, getNode],
  );

  const isValidConnection = useCallback(
    (connection: { source: string; target: string }) => {
      const sourceSubnode = getNode(connection.source) as Node<IStreamNodeData>;
      const targetSubnode = getNode(connection.target) as Node<IStreamNodeData>;

      if (
        !sourceSubnode ||
        !targetSubnode ||
        sourceSubnode.data.status !== "new" ||
        targetSubnode.data.status !== "new"
      ) {
        return false;
      }

      return checkConnection(sourceSubnode, targetSubnode);
    },
    [getNode],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const nodeId = event.dataTransfer.getData("application/reactflow");
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      dropNode(nodeId, position);
    },
    [dropNode, screenToFlowPosition],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onDrop={onDrop}
      onDragOver={onDragOver}
      nodeTypes={NODE_TYPES_MAP}
      edgeTypes={EDGE_TYPES_MAP}
      onConnect={onConnect}
      isValidConnection={isValidConnection}
      className="configuration-flow bg-primary/15"
    >
      <MiniMap nodeStrokeWidth={3} nodeColor={nodeColor} />
      <Controls>
        <ControlButton onClick={updateLayout} title="redistribute">
          <ArrowPathIcon className="fill-current text-inherit" />
        </ControlButton>
      </Controls>
      <Panel position="top-right">
        <SaveButton />
      </Panel>
      <Panel position="top-left">
        <div className="flex items-center gap-2 font-bold text-secondary">
          <span>{configurationName}</span>
        </div>
      </Panel>
      <Panel position="top-center">
        <GlobalErrors errors={errors} />
      </Panel>
      <Panel position="bottom-center">
        <div id="errors-container"></div>
      </Panel>
    </ReactFlow>
  );
}

export default Flow;
