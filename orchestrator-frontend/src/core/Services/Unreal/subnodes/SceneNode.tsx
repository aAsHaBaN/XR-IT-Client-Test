import BaseHandle from "@/core/handles/BaseHandle";
import { IStreamNodeData } from "@/types/diagram";
import { Node, NodeProps } from "@xyflow/react";

export type SceneNode = Node<IStreamNodeData>;

function SceneNode({ data }: NodeProps<SceneNode>) {
  return (
    <div className="subnode unreal-subnode unreal-scene-node">
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

export default SceneNode;
