import { Node } from "../../core/models/Node";
import { Stream } from "../../core/models/Stream";
import { SocketException } from "../../core/utils/SocketException";
import { XRITServiceID } from "../models/XRITServiceConfig";

const OPTITRACK_SERVICE_ID: XRITServiceID = "OPTITRACK";

export function addOptiTrackStreamTarget(source_node: Node, target_node: Node, stream: Stream) {
  toggleNetworkStreamTarget(source_node, target_node, stream, true);
}

export function removeOptiTrackStreamTarget(source_node: Node, target_node: Node, stream: Stream) {
  toggleNetworkStreamTarget(source_node, target_node, stream, false);
}

function toggleNetworkStreamTarget(source_node: Node, target_node: Node, stream: Stream, to_create_stream: boolean) {
  if (!source_node.configurations.some((c) => c.software_id === OPTITRACK_SERVICE_ID))
    throw new SocketException(`Node ${source_node.id} does not support OptiTrack.`);
  if (stream.target.entry_point.type.toLowerCase() != "port" || typeof stream.target.entry_point.value != "number")
    throw new SocketException(`Target entry point OptiTrack stream must be a port`);

  const stream_id = stream.id;
  const ot_stream_target = { ip: target_node.local_ip, port: stream.target.entry_point.value };
  const message = to_create_stream ? `${OPTITRACK_SERVICE_ID}:add-stream-target` : `${OPTITRACK_SERVICE_ID}:remove-stream-target`

  source_node.emit(message, stream_id, ot_stream_target);
  console.log(`Sent request \x1b[36m\x1b[1m${message}\x1b[0m to \x1b[36m${source_node.machine_alias}...\n\x1b[0m`);

}
