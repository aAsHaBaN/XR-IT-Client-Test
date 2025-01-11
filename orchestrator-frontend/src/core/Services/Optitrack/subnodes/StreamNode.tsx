import { Node, NodeProps } from "@xyflow/react";
import BaseHandle from "@/core/handles/BaseHandle";
import { IStreamNodeData } from "@/types/diagram";

export type StreamNode = Node<IStreamNodeData>;

function StreamNode({ data }: NodeProps<StreamNode>) {
  return (
    <div className="subnode optitrack-subnode optitrack-stream-node">
      <div className="subnode__content">
        <div className="subnode__handle subnode__handle--left">
          {data.input && <BaseHandle handle={data.input} />}
        </div>
        <span className="subnode__label">{data.output?.name}</span>
        <div className="subnode__handle subnode__handle--right">
          {data.output && <BaseHandle handle={data.output} />}
        </div>
      </div>
    </div>
  );
}

export default StreamNode;
