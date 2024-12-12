import NodeError from "@/components/NodeError";
import {
  EdgeProps,
  BaseEdge,
  getBezierPath,
  Position,
  useReactFlow,
  EdgeLabelRenderer,
  Edge,
} from "@xyflow/react";
import { nextTick } from "process";
import { useEffect } from "react";

export type ErrorEdge = Edge<IEdgeData>;

export default function ErrorEdge({
  id,
  style,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  ...delegated
}: EdgeProps<ErrorEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
  });

  const { updateEdge } = useReactFlow();

  useEffect(() => {
    nextTick(() =>
      updateEdge(id, {
        animated: false,
        selectable: false,
      }),
    );
  }, [updateEdge, id]);

  return (
    <>
      <BaseEdge id={id} path={path} {...delegated} className="error-edge" />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan absolute z-[10000] flex items-center justify-center rounded-full text-sm text-white"
        >
          <NodeError errors={data?.errors} />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
