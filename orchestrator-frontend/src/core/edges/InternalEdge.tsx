import {
  EdgeProps,
  useReactFlow,
  BaseEdge,
  getBezierPath,
  Position,
} from "@xyflow/react";
import { nextTick } from "process";
import { useEffect } from "react";

export default function InternalEdge({
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
        selectable: false,
      }),
    );
  }, [updateEdge, id]);

  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
  });

  return (
    <BaseEdge id={id} path={path} {...delegated} className="custom-edge" />
  );
}
