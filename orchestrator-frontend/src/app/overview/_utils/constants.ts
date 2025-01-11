import { INTERNAL_EDGE } from "@/core/edges/constants";
import InternalEdge from "@/core/edges/InternalEdge";
import { LAB_NODE } from "@/core/Lab/constants";
import LabNode from "@/core/Lab/LabNode";
import { ORCHESTRATOR_NODE } from "@/core/Orchestrator/constants";
import OrchestratorNode from "@/core/Orchestrator/OrchestratorNode";
import { EdgeTypes, NodeTypes } from "@xyflow/react";

export const NODE_TYPES_MAP: NodeTypes = {
  [ORCHESTRATOR_NODE]: OrchestratorNode,
  [LAB_NODE]: LabNode,
};

export const EDGE_TYPES_MAP: EdgeTypes = {
  [INTERNAL_EDGE]: InternalEdge,
};
