const software_ids = [
  "MVN",
  "UNREAL_ENGINE",
  "OPTITRACK",
  "METAQUEST",
  "ULTRAGRID_SEND",
  "ULTRAGRID_RECEIVE",
] as const;

export type INodeSize = {
  parentWidth: number;
  parentHeader: number;
  width: number;
  height: number;
  border: number;
  gap: number;
};
