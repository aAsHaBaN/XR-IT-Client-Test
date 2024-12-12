import { Socket } from "socket.io-client";
import { removeConfig } from "../services/configService";
import { NodeService } from "../services/XRITNode";
import { SocketException } from "../utils/SocketException";
import { isIPv4 } from "net";

export default (socket: Socket, node: NodeService) => {
  const onDegisterOrchestratorConnection = async function () {
    try {
      if (!node.config) {
        throw new SocketException(`No configuration is running on this machine.`)
      }

      const id = node.config.id;
      removeConfig(id);

      socket.emit(`node-deregistered`, id);
      await node.terminate();
      console.log(`\x1b[31m\x1b[1mNode degregistered from XR-IT network ${node.config}\x1b[0m\n`)
    } catch (e) {
      socket.emit(`error`, (e as Error).message)
    }

    console.log()
  }

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