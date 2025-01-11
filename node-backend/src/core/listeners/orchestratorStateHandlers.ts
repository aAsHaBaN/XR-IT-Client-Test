import { Socket } from "socket.io-client";
import { removeConfiguration } from "../services/configurationService";
import { NodeService } from "../services/XRITNode";
import { SocketException } from "../utils/SocketException";
import { isIPv4 } from "net";

/*
  Functions which handle messages and requests from an XR-IT network. These handlers should be 
  registered once this Node connects to a new Orchestrator in the NodeService class, with the
  socket provided being the active connection to the Orchestrator's Socket.IO server.
*/
export default (socket: Socket, node: NodeService) => {

  // Listener function which handles a command from the Orchestrator to deregister from the
  // XR-IT network it is connected to.
  const onDegisterOrchestratorConnection = async function () {
    try {
      if (!node.config) {
        throw new SocketException(`No configuration is running on this machine.`)
      }

      // Remove this XR-IT network from the list of saved configurations.
      const id = node.config.id;
      removeConfiguration(id);

      // Respond to Orchestrator with a successful deregistration message
      // Once the message is sent, the socket connection can be terminated.
      socket.emit(`node-deregistered`, id);
      await node.terminate();
      console.log(`\x1b[31m\x1b[1mNode degregistered from XR-IT network ${node.config}\x1b[0m\n`)
    } catch (e) {
      socket.emit(`error`, (e as Error).message)
    }

    console.log()
  }

  // Listener function to update the IP address this Node uses when connected to an XR-IT network
  const onUpdateNetworkIP = async function (ip_address: string) {
    try {
      console.log(`\x1b[36m\x1b[1mReceived message from the Orchestrator to change this machine's IP address.\x1b[0m\n`)

      if (!isIPv4(ip_address)) {
        throw new SocketException(`${ip_address} is not a valid IP address.`)
      }

      await node.updateNetworkIP(ip_address);
      console.log(`\x1b[33m\x1b[1mThis Node's IP address has changed within the XR-IT network to ${ip_address}.\x1b[0m\n`)
    } catch (e) {
      socket.emit(`error`, (e as Error).message)
    }
  }

  socket.on('deregister-orchestrator-connection', onDegisterOrchestratorConnection);
  socket.on('update-xrit-network-ip', onUpdateNetworkIP);
};