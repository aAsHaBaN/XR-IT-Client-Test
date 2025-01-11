import { Socket } from "socket.io-client";
import { UnrealEngineService } from "../services/unrealEngineService.js";
import { UnrealEngineInstance, UnrealEngineSettings } from "../models/UnrealEngine.js";
import { SocketException } from "../../core/utils/SocketException.js";
import { NodeService } from "../../core/services/XRITNode.js";
import { inspect } from "node:util";

const UNREAL_ENGINE_SERVICE_ID = "UNREAL_ENGINE"

/*
  Listeners which handles commands regarding Unreal Engine software including its initialization, heartbeat and stream 
  management. These requests will be made from an Orchestrator that this XR-IT Node is currently connected to.
*/
export default (socket: Socket, node: NodeService) => {

  // Listener for a heartbeat request from the Orchestrator, returns whether or not the application is running
  const onCheckUEHeartbeat = async function (configuration_id: string) {
    if (node.unreal_engine_service == undefined) {
      socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:heartbeat`, configuration_id, false);
    } else {
      const result = node.unreal_engine_service.isPluginActive();
      socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:heartbeat`, configuration_id, result);
    }
  }

  // Listener function which handles a command from the Orchestrator to launch Unreal Engine with the provided settings
  const onLaunchUEPlugin = async function (configuration_id: string, settings: UnrealEngineSettings) {
    try {
      if (node.unreal_engine_service && node.unreal_engine_service.configuration_id === configuration_id) {
        console.log("This Unreal Engine configuration is already enabled on this node, updating settings\n");
        node.unreal_engine_service.setConfiguration(settings);
        socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:initialized`, configuration_id);
      } else {
        // If Unreal Engine is already running, we first terminate it to enable a new one
        node.unreal_engine_service?.onPluginClose();
        node.unreal_engine_service = new UnrealEngineService(configuration_id, settings, socket);
      }
    } catch (e) {
      socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:error`, (e as Error).message);
    }
  };

  // Listener which sets updates the Unreal Engine plugin with the provided settings
  const onSetUEConfig = async function (config: UnrealEngineSettings) {
    try {
      if (!node.unreal_engine_service) {
        throw new SocketException("Received request to set Unreal Engine configuration, but it is not currently running on this node.");
      }

      node.unreal_engine_service.setConfiguration(config);
    } catch (e) {
      socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:error`, (e as Error).message);
    }
  };

  // Listener function which requests the current Unreal Engine plugin settings
  const onGetUEConfig = async function () {
    try {
      if (!node.unreal_engine_service) {
        throw new SocketException("Received request to get Unreal Engine configuration, but it is not currently running on this node.");
      }
      node.unreal_engine_service.getConfigurationStatus();
    } catch (e) {
      socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:error`, (e as Error).message);
    }
  };

  // Listener function which updates the existing Unreal Engine Plugin settings to create a new LiveLink Source
  const onAddStreamSource = async function (stream_id: string, config: UnrealEngineSettings) {
    try {
      if (!node.unreal_engine_service) {
        throw new SocketException("Received request to add Unreal Engine LiveLink source, but it is not currently running on this node.");
      }
      node.unreal_engine_service.addLiveLinkSource(stream_id, config);
    } catch (e) {
      socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:error`, (e as Error).message);
    }
  }

  // Listener function which updates the existing Unreal Engine Plugin settings to remove a LiveLink Source
  const onRemoveStreamSource = async function (stream_id: string, config: UnrealEngineSettings) {
    try {
      if (!node.unreal_engine_service) {
        throw new SocketException("Received request to remove Unreal Engine LiveLink source, but it is not currently running on this node.");
      }
      node.unreal_engine_service.removeLiveLinkSource(stream_id, config);
    } catch (e) {
      socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:error`, (e as Error).message);
    }
  }

  const onReceiveUnrealInstancesList = function (instances: UnrealEngineInstance[]) {
    try {
      if (!node.unreal_engine_service) {
        throw new SocketException("Received request to update Unreal Engine Plugin but it is not currently running on this node.");
      }
      node.unreal_engine_service.sendUnrealEngineList(instances);
    } catch (e) {
      socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:error`, (e as Error).message);
    }
  }

  const onMessageFromUnrealEngineInstance = function (message: { name: string, body: string }, sending_instance: UnrealEngineInstance) {
    try {
      console.log(`\x1b[32m\x1b[4mReceived message from another Unreal Engine instance, passing it along to the plugin.\x1b[0m`)
      console.log(inspect(sending_instance, false, null, true))
      console.log(inspect(message, false, null, true))
      console.log();

      if (!node.unreal_engine_service) {
        throw new SocketException("Received request to update Unreal Engine Plugin but it is not currently running on this node.");
      }
      node.unreal_engine_service.sendMessageFromUnrealEngineInstance(message, sending_instance);
    } catch (e) {
      socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:error`, (e as Error).message);
    }
  }

  const onUnrealEngineInstanceConnect = function (connected_instance: UnrealEngineInstance) {
    try {
      console.log(`\x1b[32m\x1b[4mNew Unreal Engine instance connected to the XR-IT network, passing this along to the plugin.\x1b[0m`)
      console.log(inspect(connected_instance, false, null, true))
      console.log();

      if (!node.unreal_engine_service) {
        throw new SocketException("Received request to update Unreal Engine Plugin but it is not currently running on this node.");
      }
      node.unreal_engine_service.notifyNodeConnected(connected_instance);
    } catch (e) {
      socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:error`, (e as Error).message);
    }
  }

  const onUnrealEngineInstanceDisconnect = function (disconnected_instance: UnrealEngineInstance) {
    try {
      console.log(`\x1b[32m\x1b[4mNew Unreal Engine instance disconnected from the XR-IT network, passing this along to the plugin.\x1b[0m`)
      console.log(inspect(disconnected_instance, false, null, true))
      console.log();

      if (!node.unreal_engine_service) {
        throw new SocketException("Received request to update Unreal Engine Plugin but it is not currently running on this node.");
      }
      node.unreal_engine_service.notifyNodeDisconnected(disconnected_instance);
    } catch (e) {
      socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:error`, (e as Error).message);
    }
  }

  socket.on(`${UNREAL_ENGINE_SERVICE_ID}:heartbeat`, onCheckUEHeartbeat);
  socket.on(`${UNREAL_ENGINE_SERVICE_ID}:launch`, onLaunchUEPlugin);
  socket.on(`${UNREAL_ENGINE_SERVICE_ID}:get-config`, onGetUEConfig);
  socket.on(`${UNREAL_ENGINE_SERVICE_ID}:set-config`, onSetUEConfig);
  socket.on(`${UNREAL_ENGINE_SERVICE_ID}:add-stream-source`, onAddStreamSource);
  socket.on(`${UNREAL_ENGINE_SERVICE_ID}:remove-stream-source`, onRemoveStreamSource);
  socket.on(`${UNREAL_ENGINE_SERVICE_ID}:unreal-engine-instances`, onReceiveUnrealInstancesList);
  socket.on(`${UNREAL_ENGINE_SERVICE_ID}:message-from-unreal-engine-instance`, onMessageFromUnrealEngineInstance);
  socket.on(`${UNREAL_ENGINE_SERVICE_ID}:unreal-engine-instance-connected`, onUnrealEngineInstanceConnect);
  socket.on(`${UNREAL_ENGINE_SERVICE_ID}:unreal-engine-instance-disconnected`, onUnrealEngineInstanceDisconnect);
};