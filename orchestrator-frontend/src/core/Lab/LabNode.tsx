import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import "./style.css";
import LabServiceNode from "./components/LabServiceNode";

export type LabNode = Node<ILabNodeData>;

function LabNode({ id, data }: NodeProps<LabNode>) {
  return (
    <div className="custom-node lab-node">
      <h3 className="border-b border-b-black bg-lab px-4 py-1 font-bold text-white">
        {data.label}
      </h3>
      <div className="flex flex-col text-left text-sm">
        {data.machines.map((machine) => (
          <LabServiceNode machine={machine} key={machine.ip} />
        ))}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id={id + "+input"}
        className="left-1/2 top-1/2 h-0 w-0 transform-none opacity-0"
      ></Handle>
    </div>
  );
}

export default LabNode;
