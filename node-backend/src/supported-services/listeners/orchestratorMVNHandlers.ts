import { Socket } from "socket.io-client";
import { launchMVN, addNetworkStreamingTarget, removeNetworkStreamingTarget, isMVNRunning } from "../services/mvnService.js";
import { MVNServiceID, MVNStreamingTarget } from "../models/MVN.js";
import { inspect } from "node:util";
import axios from "axios";
import { constants } from "../../core/utils/constants.js";
import { getArguments } from "../../core/utils/arguments.js";

const { EXPRESS_BASE_URL } = constants

export default (socket: Socket) => {
  const onLaunch = async function (configuration_id: string) {
    try {
      if(getArguments().is_dev) {
        await launchMVN();
      } else {
        await axios.post(`${EXPRESS_BASE_URL}/mvn/launch`);
      }
      socket.emit(`${MVNServiceID}:initialized`, configuration_id);
    } catch (err) {
      socket.emit(`${MVNServiceID}:error`, err);
    }
  };

  const onCheckMVNStatus = async function (configuration_id: string) {
    try {
      var result;
      if(getArguments().is_dev) {
        result = isMVNRunning();
      } else {
        result = await axios.post(`${EXPRESS_BASE_URL}/mvn/isRunning`);
      }

      socket.emit(`${MVNServiceID}:heartbeat`, configuration_id, result);
    } catch (err) {
      socket.emit(`${MVNServiceID}:error`, err);
    }
  }

  const onAddStreamTarget = async function (stream_id: string, stream_target: MVNStreamingTarget) {
    try {
      console.log(`\x1b[34mAttempting to create MVN stream target.\n\x1b[0m`)

      if(getArguments().is_dev) {
        const is_running = await isMVNRunning()
        if(!is_running) await launchMVN();
        addNetworkStreamingTarget(stream_target);
      } else {
        const is_running = await axios.post(`${EXPRESS_BASE_URL}/mvn/isRunning`);
        if (!is_running) await axios.post(`${EXPRESS_BASE_URL}/mvn/launch`);
        await axios.post(`${EXPRESS_BASE_URL}/mvn/add-streaming-target`);
      }
      console.log(`\x1b[32m\x1b[4mCreated MVN stream target.\x1b[0m`)
      console.log(inspect(stream_target, false, null, true) + '\n');

      socket.emit(`${MVNServiceID}:stream-target-added`, stream_id);
    } catch (err) {
      socket.emit(`${MVNServiceID}:error`, err);
    }
  };

  const onRemoveStreamTarget = async function (stream_id: string, stream_target: MVNStreamingTarget) {
    try {
      console.log(`\x1b[34mAttempting to remove MVN stream target.\n\x1b[0m`)

      if(getArguments().is_dev) {
        const is_running = await isMVNRunning()
        if(!is_running) await launchMVN();
        addNetworkStreamingTarget(stream_target);
      } else {
        const is_running = await axios.post(`${EXPRESS_BASE_URL}/mvn/isRunning`);
        if (!is_running) await axios.post(`${EXPRESS_BASE_URL}/mvn/launch`);
  
        await axios.post(`${EXPRESS_BASE_URL}/mvn/remove-streaming-target`);
      }
      console.log(`\x1b[33m\x1b[4mRemoved MVN stream target.\x1b[0m`)
      console.log(inspect(stream_target, false, null, true) + '\n');

      socket.emit(`${MVNServiceID}:stream-target-added`, stream_id);
    } catch (err) {
      socket.emit(`${MVNServiceID}:error`, err);
    }
  };

  socket.on(`${MVNServiceID}:launch`, onLaunch);
  socket.on(`${MVNServiceID}:heartbeat`, onCheckMVNStatus);
  socket.on(`${MVNServiceID}:add-stream-target`, onAddStreamTarget);
  socket.on(`${MVNServiceID}:remove-stream-target`, onRemoveStreamTarget);
};
