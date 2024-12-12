import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import "./style.css";

export type OrchestratorNode = Node<IOrchestratorNodeData>;

function OrchestratorNode({ id, data }: NodeProps<OrchestratorNode>) {
  return (
    <div className="custom-node orchestrator-node rounded-full">
      <div className="p-2 px-4">
        <h3 className="font-bold underline">{data.label}</h3>
        <h5 className="text-sm">{data.configName}</h5>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id={id + "+output"}
        className="left-1/2 top-1/2 h-1 w-1 transform-none opacity-0"
      ></Handle>
    </div>
  );
}

export default OrchestratorNode;
