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

export default class InterfacesNamespace {
  private static instance: InterfacesNamespace;
  private sockets: Socket[];
  private configuration_service: ConfigurationService;
  private vpn: SoftEtherServer;
  private lab_service: LabService;
  private node_service: NodesService;
  private stream_service: StreamsService;
  namespace: Namespace;

  private constructor(io: Server, configuration_service: ConfigurationService, vpn: SoftEtherServer, lab_service: LabService, node_service: NodesService, stream_service: StreamsService) {
    // Namespace exists and needs to be cleared
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

  static instantiate(io: Server, configuration: ConfigurationService, vpn: SoftEtherServer, labs: LabService, nodes: NodesService, streams: StreamsService) {
    InterfacesNamespace.instance = new InterfacesNamespace(io, configuration, vpn, labs, nodes, streams);
  }

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
