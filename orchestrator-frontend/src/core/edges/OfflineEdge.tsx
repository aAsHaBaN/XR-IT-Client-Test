import {
  EdgeProps,
  BaseEdge,
  getBezierPath,
  Position,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { nextTick } from "process";
import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { deleteEdge } from "@/services/config";
import { PENDING_EDGE } from "./constants";

export default function OfflineEdge({
  id,
  style,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  ...delegated
}: EdgeProps) {
  const { updateEdge } = useReactFlow();
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
  });

  useEffect(() => {
    nextTick(() =>
      updateEdge(id, {
        animated: false,
      }),
    );
  }, [updateEdge, id]);

  function onDelete() {
    deleteEdge(id);
    updateEdge(id, { type: PENDING_EDGE, selectable: false, selected: false });
  }

  return (
    <>
      <BaseEdge id={id} path={path} {...delegated} className="offline-edge" />
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
