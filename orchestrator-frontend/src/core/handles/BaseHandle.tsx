import { PlusIcon } from "@heroicons/react/24/outline";
import {
  Handle,
  Node,
  Position,
  useHandleConnections,
  useNodesData,
} from "@xyflow/react";
import { IHandle } from "./diagram";
import { IServiceNodeData } from "@/types/diagram";
import NodeError from "@/components/NodeError";
import "./BaseHandle.css";
import { getHandleStatusClass } from "./utils";

function BaseHandle({ handle }: { handle: IHandle }) {
  const connections = useHandleConnections({
    type: handle.isInput ? "target" : "source",
    id: handle.id,
  });

  const node = useNodesData(handle.nodeId) as Node<IServiceNodeData>;

  const isOnline = node && node.data.isOnline;
  const isConnectable = connections.length === 0 && handle.isConnectable;

  return (
    <div className="base-handle">
      <Handle
        type={handle.isInput ? "target" : "source"}
        position={handle.isInput ? Position.Left : Position.Right}
        id={handle.id}
        isConnectable={isConnectable}
        className={getHandleStatusClass(isOnline ? handle.status : "OFFLINE")}
      ></Handle>
      <PlusIcon
        className={`base-handle__icon ${!isConnectable ? "opacity-0" : "opacity-100"}`}
      />
      <NodeError errors={handle.errors} className="base-handle__error" />
    </div>
  );
}

export default BaseHandle;
