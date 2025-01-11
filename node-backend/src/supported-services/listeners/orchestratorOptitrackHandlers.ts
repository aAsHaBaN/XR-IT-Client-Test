import { Socket } from "socket.io-client";
import { XRITServiceID } from "../../core/models/XRITServiceID";
import { NodeService } from "../../core/services/XRITNode";
import { isMotiveOpen, killMotive, launchMotive, updateMotiveFile } from "../services/optitrackService";


const OPTITRACK_SERVICE_ID: XRITServiceID = "OPTITRACK"

/*
  Listeners which handles commands regarding OptiTrack software including its initialization and heartbeat
  management. These requests will be made from an Orchestrator that this XR-IT Node is currently connected to.
*/
export default (socket: Socket, node: NodeService) => {

  // Listener function which handles a command from the Orchestrator to launch OptiTrack
  // Here, prior to launch we update the Motive default file to enable unicast streaming from
  // the IP address of this Node within the XR-IT VPN network
  const onLaunch = async function (configuration_id: string) {
    try {
      isMotiveOpen(async (isOpen: boolean) => {
        // If motive is open, kill it to update the configuration file
        if (isOpen) await killMotive()

        // Update Motive's default configuration file to enable unicast streaming
        const localInterfaceValue: string | undefined = node.config?.vpn.adapter.ip;
        if (localInterfaceValue !== undefined) { await updateMotiveFile(localInterfaceValue, "true"); }
        await launchMotive()

        // Send success message to Orchestrator
        socket.emit(`${OPTITRACK_SERVICE_ID}:initialized`, configuration_id);
      })

    } catch (err) {
      socket.emit(`${OPTITRACK_SERVICE_ID}:error`, err);
    }
  };

  // Listener for a heartbeat request from the Orchestrator, returns whether or not the application is running
  const onCheckOptitrackStatus = async function (configuration_id: string) {
    try {
      isMotiveOpen((isOpen: boolean) => {
        socket.emit(`${OPTITRACK_SERVICE_ID}:heartbeat`, configuration_id, isOpen);
      });
    } catch (err) {
      socket.emit(`${OPTITRACK_SERVICE_ID}:error`, err);
    }
  }

  socket.on(`${OPTITRACK_SERVICE_ID}:launch`, onLaunch);
  socket.on(`${OPTITRACK_SERVICE_ID}:heartbeat`, onCheckOptitrackStatus);
};