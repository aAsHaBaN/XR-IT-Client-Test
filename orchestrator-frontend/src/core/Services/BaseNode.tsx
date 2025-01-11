import { Node, NodeProps } from "@xyflow/react";
import { IServiceNodeData } from "@/types/diagram";
import { COLORS_MAP } from "./constants";
import { formatServiceName } from "./utils";

export type BaseNode = Node<IServiceNodeData>;

export function BaseNode({ data }: { data: IServiceNodeData }) {
  return (
    <div
      className={`custom-node ${
        !data.isOnline && "custom-node--offline"
      } ${data.minified && "custom-node--minified"}`}
    >
      <div className={`custom-node__header bg-base-primary text-base-text`}>
        <h3 className="custom-node__title">
          {formatServiceName(data.label)}
          {data.isOnline && (
            <span
              className={`status absolute top-1.5 ml-2 ${data.status === "SUCCESS" ? "status--running" : "status--stopped"}`}
            ></span>
          )}
        </h3>
      </div>
      <div className="tags">
        {!data.minified && (
          <span className={`tag bg-base-primary text-base-text`}>
            {data.lab}
          </span>
        )}
        <span className={`tag bg-base-primary text-base-text`}>
          {data.machine}
        </span>
        <span className={`tag bg-base-primary text-base-text`}>{data.ip}</span>
      </div>
    </div>
  );
}

function BaseReactFlowNode({ data }: NodeProps<BaseNode>) {
  return <BaseNode data={data} />;
}

export default BaseReactFlowNode;
