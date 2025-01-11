import { Node, NodeProps } from "@xyflow/react";
import "./style.css";
import { IServiceNodeData } from "@/types/diagram";
import NodeError from "@/components/NodeError";
import { getServiceStatusClass } from "../utils";

export type MVNNode = Node<IServiceNodeData>;

export function MVNNode({ data }: { data: IServiceNodeData }) {
  return (
    <div
      className={`custom-node mvn-node ${
        !data.isOnline && "custom-node--offline"
      } ${data.minified && "custom-node--minified"}`}
    >
      <div className="custom-node__header">
        <h3 className="custom-node__title">
          {data.label}
          {data.isOnline && (
            <span
              className={`status absolute top-1.5 ml-2 ${getServiceStatusClass(
                data.status,
              )}`}
            ></span>
          )}
        </h3>
        {/* <h4 className="text-sm">
          Port in use: <b>{data.port}</b>
        </h4> */}
        <NodeError className="service-error" errors={data.errors} />
      </div>
      <div className="tags">
        {!data.minified && (
          <span className="tag bg-mvn-primary">{data.lab}</span>
        )}
        <span className="tag bg-mvn-primary">
          {data.machine}
          <NodeError className="relative" errors={data.nodeErrors} />
        </span>
        <span className="tag bg-mvn-primary">{data.ip}</span>
      </div>
      {!data.minified && (
        <div className="grid grid-cols-2">
          <div className="flex flex-col gap-1">
            {data.inputs.map((id) => (
              <div className="mvn-subnode" key={id}></div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {data.outputs.map((id) => (
              <div className="mvn-subnode" key={id}></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MVNReactFlowNode({ data }: NodeProps<MVNNode>) {
  return <MVNNode data={data} />;
}

export default MVNReactFlowNode;
