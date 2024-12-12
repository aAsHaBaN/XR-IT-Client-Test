import InterfacesNamespace from "./InterfacesNamespace.js";
import { Namespace, Server, Socket } from "socket.io";
import { NodesService } from "../services/NodesService.js";
import { StreamsService } from "../services/StreamsService.js";
import { LabService } from "../services/LabService.js";
import registerNodeStateHandlers from "../listeners/node/nodeStateHandlers.js"


export default class NodesNamespace {
  private static instance: Namespace;
  private constructor() { }

  static instantiate(io: Server, lab_service: LabService, node_service: NodesService, streams_service: StreamsService) {
    // Namespace exists and needs to be cleared
    if (NodesNamespace.instance) {
      NodesNamespace.instance.disconnectSockets();
      NodesNamespace.instance.removeAllListeners();
      io._nsps.delete('/nodes')
    }

    NodesNamespace.instance = io.of("/nodes");

    const onNodeConnection = (socket: Socket) => {
      const onNodeDisconnect = async () => {
        const matching_node = node_service.terminateNode(socket.id)

        if (matching_node) {
          streams_service.setNodeStreamsAsOffline(matching_node.id)
          console.log(`\x1b[31m${matching_node.machine_alias} \x1b[1mdisconnected.\x1b[0m`);
          console.log(`Number of nodes: ${node_service.nodes.filter((n) => n.is_online === true && n.role != "orchestrator").length}\n`);
          InterfacesNamespace.emitConfigUpdate();
        }
      };

      registerNodeStateHandlers(socket, lab_service, node_service, streams_service);
      socket.on("disconnect", onNodeDisconnect);
    };

    NodesNamespace.instance.on("connection", onNodeConnection);
    console.log("\x1b[32mNodes namespace created and listening.\x1b[0m\n")
  }
}