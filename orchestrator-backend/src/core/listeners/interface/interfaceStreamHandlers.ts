import { Socket } from "socket.io";
import { SocketException } from "../../utils/SocketException.js";
import { StreamSource, StreamTarget } from "../../models/Stream.js";
import InterfacesNamespace from "../../namespaces/InterfacesNamespace.js";
import { NodesService } from "../../services/NodesService.js";
import { StreamsService } from "../../services/StreamsService.js";

export default (socket: Socket, nodes_service: NodesService, streams_service: StreamsService) => {
  const onCreateStream = async function (source: StreamSource, target: StreamTarget, settings?: any) {
    try {
      const source_node = nodes_service.getStreamNode(source);
      const target_node = nodes_service.getStreamNode(target);
      streams_service.createStream(source_node, target_node, source, target, settings)
      InterfacesNamespace.emitConfigUpdate()
    } catch (e) {
      socket.emit("stream:error", (e as SocketException).message);
    }
  };

  const onRemoveStream = async function (streamId: string) {
    try {
      const stream = streams_service.getStream(streamId);
      const source_node = nodes_service.getStreamNode(stream.source);
      const target_node = nodes_service.getStreamNode(stream.target);
      streams_service.removeStream(stream, source_node, target_node)
      InterfacesNamespace.emitConfigUpdate()
    } catch (e) {
      socket.emit("stream:error", (e as SocketException).message);
    }
  };

  socket.on("create-stream", onCreateStream);
  socket.on("remove-stream", onRemoveStream);
};
