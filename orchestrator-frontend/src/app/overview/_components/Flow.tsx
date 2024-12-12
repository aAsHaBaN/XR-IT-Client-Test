"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type Node,
  type Edge,
  ReactFlow,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  ControlButton,
  useNodesInitialized,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

import useLayoutElements from "@/hooks/useLayoutElements";
import useTailwind from "@/hooks/useTailwind";
import { EDGE_TYPES_MAP, NODE_TYPES_MAP } from "../_utils/constants";
import { ORCHESTRATOR_NODE } from "@/core/Orchestrator/constants";
import { LAB_NODE } from "@/core/Lab/constants";
import useUpdateDiagram from "@/hooks/useUpdateDiagram";
import GlobalErrors from "@/components/GlobalErrors";
import SaveButton from "@/components/SaveButton";

type IFlowProps = {
  configNodes: Node[];
  configEdges: Edge[];
  errors: IError[];
};

function Flow({ configNodes, configEdges, errors }: IFlowProps) {
  const { fitView, zoomTo } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(configNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(configEdges);
  const [firstLoad, setFirstLoad] = useState(true);

  const updateLayout = useLayoutElements("radial");
  const nodesInitialized = useNodesInitialized();
  const tailwind = useTailwind();

  const nodeColor = useCallback(
    (node: Node) => {
      switch (node.type) {
        case ORCHESTRATOR_NODE:
          return tailwind.theme.colors["orchestrator"];
        case LAB_NODE:
          return tailwind.theme.colors["lab"];
        default:
          return "#fff";
      }
    },
    [tailwind],
  );

  useUpdateDiagram(configNodes, configEdges, setNodes, setEdges, firstLoad);

  useEffect(() => {
    if (nodesInitialized) {
      setFirstLoad(false);
      updateLayout().then(() => {
        fitView();
        zoomTo(1);
      });
    }
  }, [nodesInitialized, updateLayout, setFirstLoad]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={NODE_TYPES_MAP}
      edgeTypes={EDGE_TYPES_MAP}
      className="dashboard-flow bg-primary/15"
    >
      <MiniMap nodeStrokeWidth={3} nodeColor={nodeColor} />
      <Controls>
        <ControlButton onClick={updateLayout} title="redistribute">
          <ArrowPathIcon className="fill-current text-inherit" />
        </ControlButton>
      </Controls>
      <Panel position="top-center">
        <GlobalErrors errors={errors} />
      </Panel>
      <Panel position="top-right">
        <SaveButton />
      </Panel>
      <Panel position="bottom-center">
        <div id="errors-container"></div>
      </Panel>
    </ReactFlow>
  );
}

export default Flow;
