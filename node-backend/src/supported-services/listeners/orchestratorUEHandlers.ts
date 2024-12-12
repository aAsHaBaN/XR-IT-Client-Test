import { Socket } from "socket.io-client";
import { UnrealEngineService } from "../services/unrealEngineService.js";
import { UEServiceID, UnrealEngineSettings } from "../models/UnrealEngine.js";
import { SocketException } from "../../core/utils/SocketException.js";
import { NodeService } from "../../core/services/XRITNode.js";

export default (socket: Socket, node: NodeService) => {
  const onCheckUEHeartbeat = async function (configuration_id: string) {
    if (node.unreal_engine_service == undefined) {
      socket.emit(`${UEServiceID}:heartbeat`, configuration_id, false);
    } else {
      const result = node.unreal_engine_service.isUnrealEngineRunning();
      socket.emit(`${UEServiceID}:heartbeat`, configuration_id, result);
    }
  }

  const onLaunchUEPlugin = async function (configuration_id: string, settings: UnrealEngineSettings) {
    try {
      if (node.unreal_engine_service && node.unreal_engine_service.configuration_id === configuration_id) {
        console.log("This Unreal Engine configuration is already enabled on this node, updating settings\n");
        node.unreal_engine_service.setConfiguration(settings);
      } else {
        node.unreal_engine_service?.terminate();
        node.unreal_engine_service = new UnrealEngineService(configuration_id, settings, socket);
      }
    } catch (e) {
      socket.emit(`${UEServiceID}:error`, (e as Error).message);
    }
  };

  const onSetUEConfig = async function (config: UnrealEngineSettings) {
    try {
      if (!node.unreal_engine_service) {
        throw new SocketException("Received request to set Unreal Engine configuration, but it is not currently running on this node.");
      }

      node.unreal_engine_service.setConfiguration(config);
    } catch (e) {
      socket.emit(`${UEServiceID}:error`, (e as Error).message);
    }
  };

  const onGetUEConfig = async function () {
    try {
      if (!node.unreal_engine_service) {
        throw new SocketException("Received request to get Unreal Engine configuration, but it is not currently running on this node.");
      }
      node.unreal_engine_service.getConfigurationStatus();
    } catch (e) {
      socket.emit(`${UEServiceID}:error`, (e as Error).message);
    }
  };

  const onAddStreamSource = async function (stream_id: string, config: UnrealEngineSettings) {
    try {
      if (!node.unreal_engine_service) {
        throw new SocketException("Received request to add Unreal Engine LiveLink source, but it is not currently running on this node.");
      }
      node.unreal_engine_service.addLiveLinkSource(stream_id, config);
    } catch (e) {
      socket.emit(`${UEServiceID}:error`, (e as Error).message);
    }
  }

  const onRemoveStreamSource = async function (stream_id: string, config: UnrealEngineSettings) {
    try {
      if (!node.unreal_engine_service) {
        throw new SocketException("Received request to remove Unreal Engine LiveLink source, but it is not currently running on this node.");
      }
      node.unreal_engine_service.removeLiveLinkSource(stream_id, config);
    } catch (e) {
      socket.emit(`${UEServiceID}:error`, (e as Error).message);
    }
  }

  socket.on(`${UEServiceID}:heartbeat`, onCheckUEHeartbeat);
  socket.on(`${UEServiceID}:launch`, onLaunchUEPlugin);
  socket.on(`${UEServiceID}:get-config`, onGetUEConfig);
  socket.on(`${UEServiceID}:set-config`, onSetUEConfig);
  socket.on(`${UEServiceID}:add-stream-source`, onAddStreamSource);
  socket.on(`${UEServiceID}:remove-stream-source`, onRemoveStreamSource);
};