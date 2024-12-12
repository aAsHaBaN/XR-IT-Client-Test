export const MVNServiceID = "MVN";

export interface MVNStreamingTarget {
  stream_id: String;
  target_node: String;
  ip: String;
  port: Number;
}