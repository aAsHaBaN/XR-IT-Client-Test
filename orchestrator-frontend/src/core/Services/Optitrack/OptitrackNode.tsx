import { Node, NodeProps } from "@xyflow/react";
import "./style.css";
import { IServiceNodeData } from "@/types/diagram";
import NodeError from "@/components/NodeError";

export type OptitrackNode = Node<IServiceNodeData>;

export function OptitrackNode({ data }: { data: IServiceNodeData }) {
  return (
    <div
      className={`custom-node optitrack-node text-optitrack-text ${
        !data.isOnline && "custom-node--offline"
      } ${data.minified && "custom-node--minified"}`}
    >
      <div className="custom-node__header">
        <h3 className="custom-node__title">
          {data.label}
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
          <span className="tag bg-optitrack-primary">{data.lab}</span>
        )}
        <span className="tag bg-optitrack-primary">
          {data.machine}
          <NodeError className="relative" errors={data.nodeErrors} />
        </span>
        <span className="tag bg-optitrack-primary">{data.ip}</span>
      </div>
      {!data.minified && (
        <div className="grid grid-cols-2">
          <div className="flex flex-col gap-1">
            {data.inputs.map((id) => (
              <div className="optitrack-subnode" key={id}></div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {data.outputs.map((id) => (
              <div className="optitrack-subnode" key={id}></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OptitrackReactFlowNode({ data }: NodeProps<OptitrackNode>) {
  return <OptitrackNode data={data} />;
}

export default OptitrackReactFlowNode;
