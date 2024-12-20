import { Node, NodeProps } from "@xyflow/react";
import "./style.css";
import { IServiceNodeData } from "@/types/diagram";
import NodeError from "@/components/NodeError";
import { formatServiceName, getServiceStatusClass } from "../utils";

export type UltragridReceiveNode = Node<IServiceNodeData>;

export function UltragridReceiveNode({ data }: { data: IServiceNodeData }) {
  return (
    <div
      className={`custom-node ultragrid-receive-node text-ultragrid-receive-text ${
        !data.isOnline && "custom-node--offline"
      } ${data.minified && "custom-node--minified"}`}
    >
      <div className="custom-node__header">
        <h3 className="custom-node__title">
          {formatServiceName(data.label)}
          {data.isOnline && (
            <span
              className={`status absolute top-1.5 ml-2 ${getServiceStatusClass(
                data.status,
              )}`}
            ></span>
          )}
        </h3>
        <NodeError className="service-error" errors={data.errors} />
      </div>
      <div className="tags">
        {!data.minified && (
          <span className="tag bg-ultragrid-receive-primary">{data.lab}</span>
        )}
        <span className="tag bg-ultragrid-receive-primary">
          {data.machine}
          <NodeError className="relative" errors={data.nodeErrors} />
        </span>
        <span className="tag bg-ultragrid-receive-primary">{data.ip}</span>
      </div>
      {!data.minified && (
        <div className="grid grid-cols-2">
          <div className="flex flex-col gap-1">
            {data.inputs.map((id) => (
              <div className="ultragrid-receive-subnode" key={id}></div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {data.outputs.map((id) => (
              <div className="ultragrid-receive-subnode" key={id}></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UltragridReceiveReactFlowNode({
  data,
}: NodeProps<UltragridReceiveNode>) {
  return <UltragridReceiveNode data={data} />;
}

export default UltragridReceiveReactFlowNode;
