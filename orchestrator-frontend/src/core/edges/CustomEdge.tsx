import { deleteEdge } from "@/services/config";
import {
  EdgeProps,
  useReactFlow,
  BaseEdge,
  getBezierPath,
  Position,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { nextTick } from "process";
import { useEffect } from "react";
import { PENDING_EDGE } from "./constants";

export default function CustomEdge({
  id,
  source,
  sourceX,
  sourceY,
  target,
  targetX,
  targetY,
  selected,
  ...delegated
}: EdgeProps) {
  const { updateEdge } = useReactFlow();

  useEffect(() => {
    nextTick(() =>
      updateEdge(id, {
        animated: true,
      }),
    );
  }, [updateEdge, id]);

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
  });

  function onDelete() {
    deleteEdge(id);
    updateEdge(id, { type: PENDING_EDGE, selectable: false, selected: false });
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        {...delegated}
        className={`custom-edge ${selected ? "custom-edge--selected" : ""}`}
      />
      <EdgeLabelRenderer>
        <button
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            display: selected ? "block" : "none",
          }}
          className="nodrag nopan absolute z-[10000] flex h-5 w-5 items-center justify-center rounded-full bg-teal-900 text-sm text-white"
          onClick={onDelete}
        >
          ×
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
