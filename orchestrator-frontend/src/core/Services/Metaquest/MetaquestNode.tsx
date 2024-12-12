import { Node, NodeProps } from "@xyflow/react";
import "./style.css";
import { IServiceNodeData } from "@/types/diagram";
import NodeError from "@/components/NodeError";

export type MetaquestNode = Node<IServiceNodeData>;

export function MetaquestNode({ data }: { data: IServiceNodeData }) {
  return (
    <div
      className={`custom-node metaquest-node text-metaquest-text ${
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
          <span className="tag bg-metaquest-primary">{data.lab}</span>
        )}
        <span className="tag bg-metaquest-primary">
          {data.machine}
          <NodeError className="relative" errors={data.nodeErrors} />
        </span>
        <span className="tag bg-metaquest-primary">{data.ip}</span>
      </div>
      {!data.minified && (
        <div className="grid grid-cols-2">
          <div className="flex flex-col gap-1">
            {data.inputs.map((id) => (
              <div className="metaquest-subnode" key={id}></div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {data.outputs.map((id) => (
              <div className="metaquest-subnode" key={id}></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaquestReactFlowNode({ data }: NodeProps<MetaquestNode>) {
  return <MetaquestNode data={data} />;
}

export default MetaquestReactFlowNode;
