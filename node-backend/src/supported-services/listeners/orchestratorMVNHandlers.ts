import { Socket } from "socket.io-client";
import { launchMVN, addNetworkStreamingTarget, isMVNRunning } from "../services/mvnService.js";
import { inspect } from "node:util";
import axios from "axios";
import { constants } from "../../core/utils/constants.js";
import { getArguments } from "../../core/utils/arguments.js";

const { EXPRESS_BASE_URL } = constants
const MVN_SERVICE_ID = "MVN"

/*
  Listeners which handles commands regarding MVN software including its initialization, heartbeat and stream 
  management. These requests will be made from an Orchestrator that this XR-IT Node is currently connected to.
*/
export default (socket: Socket) => {

  // Listener function which handles a command from the Orchestrator to launch MVN
  const onLaunch = async function (configuration_id: string) {
    try {
      // Given that launching MVN requires running a powershell script we must determine if 
      // this application is running on a Docker container
      if (getArguments().is_dev) {
        await launchMVN();
      } else {
        await axios.post(`${EXPRESS_BASE_URL}/mvn/launch`);
      }

      // Send success message to Orchestrator once initialized with the id of the service launched
      socket.emit(`${MVN_SERVICE_ID}:initialized`, configuration_id);
    } catch (err) {
      socket.emit(`${MVN_SERVICE_ID}:error`, err);
    }
  };

  // Listener for a heartbeat request from the Orchestrator, returns whether or not the application is running
  const onCheckMVNStatus = async function (configuration_id: string) {
    try {
      var result;

      // Given that launching MVN requires running a powershell script we must determine if 
      // this application is running on a Docker container
      if (getArguments().is_dev) {
        result = isMVNRunning();
      } else {
        result = await axios.post(`${EXPRESS_BASE_URL}/mvn/isRunning`);
      }

      socket.emit(`${MVN_SERVICE_ID}:heartbeat`, configuration_id, result);
    } catch (err) {
      socket.emit(`${MVN_SERVICE_ID}:error`, err);
    }
  }

  // Listener for a request from the Orchestrator to create a new stream within MVN
  const onAddStreamTarget = async function (stream_id: string, stream_target: { ip: String, port: Number }) {
    try {
      console.log(`\x1b[34mAttempting to create MVN stream target.\n\x1b[0m`)

      // Given that launching MVN requires running a powershell script we must determine if 
      // this application is running on a Docker container
      if (getArguments().is_dev) {
        const is_running = await isMVNRunning()
        if (!is_running) await launchMVN();
        addNetworkStreamingTarget(stream_target);
      } else {
        const is_running = await axios.post(`${EXPRESS_BASE_URL}/mvn/isRunning`);
        if (!is_running) await axios.post(`${EXPRESS_BASE_URL}/mvn/launch`);
        await axios.post(`${EXPRESS_BASE_URL}/mvn/add-streaming-target`);
      }
      console.log(`\x1b[32m\x1b[4mCreated MVN stream target.\x1b[0m`)
      console.log(inspect(stream_target, false, null, true) + '\n');

      socket.emit(`${MVN_SERVICE_ID}:stream-target-added`, stream_id);
    } catch (err) {
      socket.emit(`${MVN_SERVICE_ID}:error`, err);
    }
  };

  // Listener for a request from the Orchestrator to remove a stream from MVN
  const onRemoveStreamTarget = async function (stream_id: string, stream_target: { ip: String, port: Number }) {
    try {
      console.log(`\x1b[34mAttempting to remove MVN stream target.\n\x1b[0m`)

      // Given that launching MVN requires running a powershell script we must determine if 
      // this application is running on a Docker container
      if (getArguments().is_dev) {
        const is_running = await isMVNRunning()
        if (!is_running) await launchMVN();
        addNetworkStreamingTarget(stream_target);
      } else {
        const is_running = await axios.post(`${EXPRESS_BASE_URL}/mvn/isRunning`);
        if (!is_running) await axios.post(`${EXPRESS_BASE_URL}/mvn/launch`);

        await axios.post(`${EXPRESS_BASE_URL}/mvn/remove-streaming-target`);
      }
      console.log(`\x1b[33m\x1b[4mRemoved MVN stream target.\x1b[0m`)
      console.log(inspect(stream_target, false, null, true) + '\n');

      socket.emit(`${MVN_SERVICE_ID}:stream-target-added`, stream_id);
    } catch (err) {
      socket.emit(`${MVN_SERVICE_ID}:error`, err);
    }
  };

  socket.on(`${MVN_SERVICE_ID}:launch`, onLaunch);
  socket.on(`${MVN_SERVICE_ID}:heartbeat`, onCheckMVNStatus);
  socket.on(`${MVN_SERVICE_ID}:add-stream-target`, onAddStreamTarget);
  socket.on(`${MVN_SERVICE_ID}:remove-stream-target`, onRemoveStreamTarget);
};
