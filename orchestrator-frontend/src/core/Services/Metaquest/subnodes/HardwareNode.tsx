import { Node, NodeProps } from "@xyflow/react";
import BaseHandle from "@/core/handles/BaseHandle";
import { IStreamNodeData } from "@/types/diagram";

export type HardwareNode = Node<IStreamNodeData>;

function HardwareNode({ data }: NodeProps<HardwareNode>) {
  return (
    <div className="subnode metaquest-subnode metaquest-stream-node">
      <div className="subnode__content">
        <div className="subnode__handle subnode__handle--left">
          {data.input && <BaseHandle handle={data.input} />}
        </div>
        <span className="subnode__label">{data.input?.name}</span>
        <div className="subnode__handle subnode__handle--right">
          {data.output && <BaseHandle handle={data.output} />}
        </div>
      </div>
    </div>
  );
}

export default HardwareNode;
