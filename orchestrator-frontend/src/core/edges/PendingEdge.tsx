import { EdgeProps, BaseEdge, getBezierPath, Position } from "@xyflow/react";

export default function PendingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  ...delegated
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
  });

  return (
    <BaseEdge id={id} path={path} {...delegated} className="pending-edge" />
  );
}
