import { Socket } from "socket.io-client";
import { XRITServiceID } from "../../core/models/XRITServiceID";
import { NodeService } from "../../core/services/XRITNode";
import { isMotiveOpen, killMotive, launchMotive, updateMotiveFile } from "../services/optitrackService";


const OPTITRACK_SERVICE_ID: XRITServiceID = "OPTITRACK"

export default (socket: Socket, node: NodeService) => {
  const onLaunch = async function (configuration_id: string, configuration_settings: any) {
    try {
      isMotiveOpen(async (isOpen) => {
        if(isOpen) await killMotive()
          const localInterfaceValue: string | undefined = node.config?.vpn.adapter.ip;
        if (localInterfaceValue !== undefined) { await updateMotiveFile(localInterfaceValue, "true"); }
        await launchMotive()
        socket.emit(`${OPTITRACK_SERVICE_ID}:initialized`, configuration_id);
      })

    } catch (err) {
      socket.emit(`${OPTITRACK_SERVICE_ID}:error`, err);
    }
  };


  const onCheckOptitrackStatus = async function (configuration_id: string) {
    try {
      isMotiveOpen((isOpen) => {
        socket.emit(`${OPTITRACK_SERVICE_ID}:heartbeat`, configuration_id, isOpen);
      });
    } catch (err) {
      socket.emit(`${OPTITRACK_SERVICE_ID}:error`, err);
    }
  }

  socket.on(`${OPTITRACK_SERVICE_ID}:launch`, onLaunch);
  socket.on(`${OPTITRACK_SERVICE_ID}:heartbeat`, onCheckOptitrackStatus);
};