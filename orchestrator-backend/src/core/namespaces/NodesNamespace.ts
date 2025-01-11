import InterfacesNamespace from "./InterfacesNamespace.js";
import { Namespace, Server, Socket } from "socket.io";
import { NodesService } from "../services/NodesService.js";
import { StreamsService } from "../services/StreamsService.js";
import { LabService } from "../services/LabService.js";
import registerNodeStateHandlers from "../listeners/node/nodeStateHandlers.js"

/*
  Socket.IO namespace responsible for all communications between the Orchestrator
  and connected Nodes. Here, this namespace will forward commands to the Nodes for
  operation executation, such as creating streams within softwares. Conversely,
  Nodes will need to send updates to the Orchestrator, such as software failure
  or successful updates. This interface will be registered at:

  http://{orchestrator_ip}:1194/nodes

  To understand how to connect to this Socket.IO server and send / receive messages
  please refer to the Socket.IO documentation. 

  To find possible messages from / to the Nodes Namespace please refer to the
  XR-IT documentation.
*/
export default class NodesNamespace {
  private static instance: Namespace;
  private constructor() { }

  // This class follows a singleton pattern, meaning only one instance of it can run on an Orchestrator.
  // This instantiation happens when a new Orchestrator function is launched in the launchOrchestrator function
  // located in the index.ts file.
  static instantiate(io: Server, lab_service: LabService, node_service: NodesService, streams_service: StreamsService) {
    // If instance of this namespace exists (another Orchestrator was running) 
    // it needs to be cleared and all connections terminated.
    if (NodesNamespace.instance) {
      NodesNamespace.instance.disconnectSockets();
      NodesNamespace.instance.removeAllListeners();
      io._nsps.delete('/nodes')
    }

    NodesNamespace.instance = io.of("/nodes");

    const onNodeConnection = (socket: Socket) => {
      const onNodeDisconnect = async () => {
        const matching_node = node_service.terminateNode(socket.id)

        // If disconnect occurs successfully, we must set all relevant streams as offline.
        if (matching_node) {
          streams_service.setNodeStreamsAsOffline(matching_node.id)
          console.log(`\x1b[31m${matching_node.machine_alias} \x1b[1mdisconnected.\x1b[0m`);
          console.log(`Number of nodes: ${node_service.nodes.filter((n) => n.is_online === true && n.role != "orchestrator").length}\n`);
          InterfacesNamespace.emitConfigUpdate();
        }
      };

      // On Node connection we must register relevant listeners for messages from a Node
      registerNodeStateHandlers(socket, lab_service, node_service, streams_service);
      socket.on("disconnect", onNodeDisconnect);
    };

    NodesNamespace.instance.on("connection", onNodeConnection);
    console.log("\x1b[32mNodes namespace created and listening.\x1b[0m\n")
  }
}