import { Node, NodeProps } from "@xyflow/react";
import BaseHandle from "@/core/handles/BaseHandle";
import { IStreamNodeData } from "@/types/diagram";

export type LiveLinkNode = Node<IStreamNodeData>;

function LiveLinkNode({ data }: NodeProps<LiveLinkNode>) {
  return (
    <div className="subnode unreal-subnode unreal-livelink-node">
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

export default LiveLinkNode;
