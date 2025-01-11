import { Socket } from "socket.io";
import { SocketException } from "../../utils/SocketException.js";
import { StreamSource, StreamTarget } from "../../models/Stream.js";
import InterfacesNamespace from "../../namespaces/InterfacesNamespace.js";
import { NodesService } from "../../services/NodesService.js";
import { StreamsService } from "../../services/StreamsService.js";

/*
  Listeners which handle requests for management of Streams within an XR-IT network. These requests 
  should be made from Orchestrator front-end interfaces who are connected to the Interfaces Namespace.
  See more on this in: src > core > namespaces > InterfacesNamespace.ts
*/
export default (socket: Socket, nodes_service: NodesService, streams_service: StreamsService) => {

  /* 
    Handles creating a new stream between two XR-IT softwares on active nodes. Once this function
    completes the services are placed in PENDING states and the operation is forwarded to the
    respective nodes. On success of creating the streams within these softwares, a success message
    is sent back to the Orchestrator from Node and stream update is complete. 
  */
  const onCreateStream = async function (source: StreamSource, target: StreamTarget, settings?: any) {
    try {
      const source_node = nodes_service.getNode(source.node_id);
      const target_node = nodes_service.getNode(target.node_id);
      streams_service.createStream(source_node, target_node, source, target, settings)
      InterfacesNamespace.emitConfigUpdate()
    } catch (e) {
      socket.emit("stream:error", (e as SocketException).message);
    }
  };

  /* 
    Handles removing an existing stream between two XR-IT softwares. Once this function
    completes the services are placed in PENDING_DELETE states and the operation is forwarded to the
    respective nodes. On success of removing the streams within these softwares, a success message
    is sent back to the Orchestrator from Node and stream update is complete. 
  */
  const onRemoveStream = async function (streamId: string) {
    try {
      const stream = streams_service.getStream(streamId);
      const source_node = nodes_service.getNode(stream.source.node_id);
      const target_node = nodes_service.getNode(stream.target.node_id);
      streams_service.removeStream(stream, source_node, target_node)
      InterfacesNamespace.emitConfigUpdate()
    } catch (e) {
      socket.emit("stream:error", (e as SocketException).message);
    }
  };

  socket.on("create-stream", onCreateStream);
  socket.on("remove-stream", onRemoveStream);
};
