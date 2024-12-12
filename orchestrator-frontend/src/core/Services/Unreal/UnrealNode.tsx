import { Node, NodeProps } from "@xyflow/react";
import "./style.css";
import { IServiceNodeData } from "@/types/diagram";
import { formatServiceName } from "../utils";
import Alert from "@/components/Alert";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import NodeError from "@/components/NodeError";

export type UnrealNode = Node<IServiceNodeData>;

export function UnrealNode({ data }: { data: IServiceNodeData }) {
  const [showErrors, setShowErrors] = useState(false);

  return (
    <div
      className={`custom-node unreal-node ${
        !data.isOnline && "custom-node--offline"
      } ${data.minified && "custom-node--minified"}`}
    >
      <div className="custom-node__header">
        <h3 className="custom-node__title">
          {formatServiceName(data.label)}
          {data.isOnline && (
            <span
              className={`status absolute top-1.5 ml-2 ${data.status === "SUCCESS" ? "status--running" : "status--stopped"}`}
            ></span>
          )}
        </h3>
        <NodeError className="service-error" errors={data.errors} />
      </div>
      <div className="tags">
        {!data.minified && (
          <span className="tag bg-unreal-primary">{data.lab}</span>
        )}
        <span className="tag bg-unreal-primary">
          {data.machine}
          <NodeError className="relative" errors={data.nodeErrors} />
        </span>
        <span className="tag bg-unreal-primary">{data.ip}</span>
      </div>
      {!data.minified && (
        <div className="grid grid-cols-2">
          <div className="flex flex-col gap-1">
            {data.inputs.map((id) => (
              <div className="unreal-subnode" key={id}></div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {data.outputs.map((id) => (
              <div className="unreal-subnode" key={id}></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UnrealReactFlowNode({ data }: NodeProps<UnrealNode>) {
  return <UnrealNode data={data} />;
}

export default UnrealReactFlowNode;
