import { Socket } from "socket.io-client";
import { launchMVN, addNetworkStreamingTarget, removeNetworkStreamingTarget, isMVNRunning } from "../services/mvnService.js";
import { MVNServiceID, MVNStreamingTarget } from "../models/MVN.js";
import { inspect } from "node:util";

export default (socket: Socket) => {
  const onLaunch = function (configuration_id: string) {
    launchMVN().then(() => {
      socket.emit(`${MVNServiceID}:initialized`, configuration_id);
    })
      .catch((err) => {
        socket.emit(`${MVNServiceID}:error`, err);
      });
  };

  const onCheckMVNStatus = async function (configuration_id: string) {
    isMVNRunning().then((result) => {
      socket.emit(`${MVNServiceID}:heartbeat`, configuration_id, result);
    })
      .catch((err) => {
        socket.emit(`${MVNServiceID}:error`, err);
      });
  }

  const onAddStreamTarget = async function (stream_id: string, stream_target: MVNStreamingTarget) {
    const is_running = await isMVNRunning();
    if(!is_running) await launchMVN();

    console.log(`\x1b[34mAttempting to create MVN stream target.\n\x1b[0m`)
    addNetworkStreamingTarget(stream_target)
      .then(() => {
        console.log(`\x1b[32m\x1b[4mCreated MVN stream target.\x1b[0m`)
        console.log(inspect(stream_target, false, null, true) + '\n');
        socket.emit(`${MVNServiceID}:stream-target-added`, stream_id);
      })
      .catch((err) => {
        console.log(`\x1b[31m\x1b[4mError creating MVN stream target.\x1b[0m`)
        console.log(err.message + '\n');
        socket.emit(`${MVNServiceID}:stream-target-error`, err);
      });
  };

  const onRemoveStreamTarget = async function (stream_id: string, stream_target: MVNStreamingTarget) {
    const is_running = await isMVNRunning();
    if(!is_running) await launchMVN();
    
    console.log(`\x1b[34mAttempting to remove MVN stream target.\n\x1b[0m`)
    removeNetworkStreamingTarget(stream_target)
      .then(() => {
        console.log(`\x1b[32m\x1b[4mRemoved MVN stream target.\x1b[0m`)
        console.log(inspect(stream_target, false, null, true) + '\n');
        socket.emit(`${MVNServiceID}:stream-target-removed`, stream_id);
      })
      .catch((err) => {
        console.log(`\x1b[31m\x1b[4mError removed MVN stream target.\x1b[0m`)
        console.log(err.message + '\n');
        socket.emit(`${MVNServiceID}:stream-target-error`, err);
      });
  };

  socket.on(`${MVNServiceID}:launch`, onLaunch);
  socket.on(`${MVNServiceID}:heartbeat`, onCheckMVNStatus);
  socket.on(`${MVNServiceID}:add-stream-target`, onAddStreamTarget);
  socket.on(`${MVNServiceID}:remove-stream-target`, onRemoveStreamTarget);
};
