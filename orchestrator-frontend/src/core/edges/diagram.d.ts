import {
  CUSTOM_EDGE,
  ERROR_EDGE,
  OFFLINE_EDGE,
  PENDING_EDGE,
} from "./constants";

export const edgeTypes = [
  CUSTOM_EDGE,
  PENDING_EDGE,
  ERROR_EDGE,
  OFFLINE_EDGE,
] as const;
export type EdgeType = (typeof edgeTypes)[number];

type IEdgeData = {
  errors: IError[];
};
