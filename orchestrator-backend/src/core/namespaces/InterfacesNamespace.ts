import registerInterfaceStreamHandlers from "../listeners/interface/interfaceStreamHandlers";
import registerInterfaceConfigHandlers from "../listeners/interface/interfaceConfigHandlers.js";
import registerInterfaceNodeHandlers from "../listeners/interface/interfaceNodeHandlers";
import registerInterfaceLabHandlers from "../listeners/interface/interfaceLabHandlers";
import { Namespace, Server, Socket } from "socket.io";
import { SocketException } from "../utils/SocketException";
import { NodesService } from "../services/NodesService";
import { StreamsService } from "../services/StreamsService";
import { ConfigurationService, serializeState } from "../services/ConfigurationService";
import { SoftEtherServer } from "../services/SoftEtherService";
import { LabService } from "../services/LabService";

/*
  Socket.IO namespace responsible for all communications from and to instances of the
  XR-IT Orchestrator front end interface. This interface will be registered at:

  http://{orchestrator_ip}:1194/interfaces

  To understand how to connect to this Socket.IO server and send / receive messages
  please refer to the Socket.IO documentation. 

  To find possible messages from / to the Interfaces Namespace please refer to the
  XR-IT documentation.
*/
export default class InterfacesNamespace {
  private static instance: InterfacesNamespace;
  private sockets: Socket[];
  private configuration_service: ConfigurationService;
  private vpn: SoftEtherServer;
  private lab_service: LabService;
  private node_service: NodesService;
  private stream_service: StreamsService;
  private namespace: Namespace;

  private constructor(io: Server, configuration_service: ConfigurationService, vpn: SoftEtherServer, lab_service: LabService, node_service: NodesService, stream_service: StreamsService) {
    // If instance of this namespace exists (another Orchestrator was running) 
    // it needs to be cleared and all connections terminated.
    if (InterfacesNamespace.instance) {
      InterfacesNamespace.instance.namespace.disconnectSockets();
      InterfacesNamespace.instance.namespace.removeAllListeners();
      io._nsps.delete('/interfaces')
    }

    this.sockets = [];
    this.namespace = io.of("/interfaces");

    this.configuration_service = configuration_service;
    this.vpn = vpn;
    this.lab_service = lab_service;
    this.node_service = node_service;
    this.stream_service = stream_service;

    const onInterfaceConnection = (socket: Socket) => {
      const onInterfaceDisconnect = () => {
        this.sockets = this.sockets.filter((s: Socket) => s.id != socket.id);

        console.log(`Interface from ${socket.handshake.address} disconnected.`);
        console.log(`Number of interfaces: ${this.sockets.length}\n`);
      };

      socket.on("disconnect", onInterfaceDisconnect);

      // Once a new interface instance connects, we must register all listeners with this socket
      registerInterfaceConfigHandlers(socket, configuration_service, vpn, lab_service, node_service, stream_service);
      registerInterfaceLabHandlers(socket, lab_service, node_service);
      registerInterfaceNodeHandlers(socket, node_service, stream_service);
      registerInterfaceStreamHandlers(socket, node_service, stream_service);

      this.sockets.push(socket);
      console.log(`Interface from ${socket.handshake.address} connected.`);
      console.log(`Number of interfaces: ${this.sockets.length}\n`);
    };

    this.namespace.on("connection", onInterfaceConnection);
    console.log("\x1b[32mInterfaces namespace created and listening.\x1b[0m\n")
  }

  // This class follows a singleton pattern, meaning only one instance of it can run on an Orchestrator.
  // This instantiation happens when a new Orchestrator function is launched in the launchOrchestrator function
  // located in the index.ts file.
  static instantiate(io: Server, configuration: ConfigurationService, vpn: SoftEtherServer, labs: LabService, nodes: NodesService, streams: StreamsService) {
    InterfacesNamespace.instance = new InterfacesNamespace(io, configuration, vpn, labs, nodes, streams);
  }

  // Broadcasts the current state of the Orchestrator to all connected interfaces.
  // This function should be executed after the state is updated.
  static emitConfigUpdate() {
    if (!InterfacesNamespace.instance) throw new SocketException('Interfaces namespace is not yet initialized!')

    const orchestrator_heading = InterfacesNamespace.instance.configuration_service;
    const vpn = InterfacesNamespace.instance.vpn;
    const labs = InterfacesNamespace.instance.lab_service.labs;
    const nodes = InterfacesNamespace.instance.node_service.nodes;
    const streams = InterfacesNamespace.instance.stream_service.streams
    const pending_streams = InterfacesNamespace.instance.stream_service.pending_streams;

    const state = serializeState(orchestrator_heading, vpn, labs, nodes, streams, pending_streams);
    // console.log(`\x1b[4m\x1b[35mOrchestrator status updated\x1b[0m`);
    // console.log(inspect(state, false, null, true));
    // console.log();
    InterfacesNamespace.instance.namespace.emit("config:orchestrator-config-updated", state);
  }
}
