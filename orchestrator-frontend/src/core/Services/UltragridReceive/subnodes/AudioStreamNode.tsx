import { Node, NodeProps } from "@xyflow/react";
import BaseHandle from "@/core/handles/BaseHandle";
import { IUltragridReceiveNodeData } from "../configuration";

export type AudioStreamNode = Node<IUltragridReceiveNodeData>;

function AudioStreamNode({ data }: NodeProps<AudioStreamNode>) {
  return (
    <div className="subnode ultragrid-receive-subnode ultragrid-receive-stream-node">
      <div className="subnode__content">
        <div className="subnode__handle subnode__handle--left">
          {data.input && <BaseHandle handle={data.input} />}
        </div>
        <div className="ultragrid-receive-subnode__settings">
          <h6 className="subnode__label">Audio Stream</h6>
        </div>
        <div className="subnode__handle subnode__handle--right">
          {data.output && <BaseHandle handle={data.output} />}
        </div>
      </div>
    </div>
  );
}

export default AudioStreamNode;
