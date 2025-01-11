import { UnrealEngineSettings } from "../models/UnrealEngine";
import { SocketException } from "../../core/utils/SocketException";
import { XRITServiceError, XRITServiceID, XRITServicesConfig } from "../models/XRITServiceConfig";
import InterfacesNamespace from "../../core/namespaces/InterfacesNamespace";
import { Node } from "../../core/models/Node";
import { inspect } from "util";
import { Stream } from "../../core/models/Stream";
import { NodesService } from "../../core/services/NodesService";
import { StreamsService } from "../../core/services/StreamsService";
import { onReceiveHeartBeatResponse } from "../../core/services/HeartbeatService";
import { notifyOfInstanceConnect, notifyOfInstanceDisconnect, sendListOfUnrealEngineInstances, sendMessageFromUnrealEngineInstance, transformNodeToUEInstance } from "../services/UnrealEngineService";

/*
  Listeners which handles requests and updates regarding Unreal Engine software service updates, 
  including its initialization, heartbeat and stream management. These requests should be made
  from an XR-IT Node connected to the Nodes Namespace.
  
  See more on this in: src > core > namespaces > NodesNamespace.ts
*/
export default (node: Node, node_service: NodesService, stream_service: StreamsService) => {
  const UE_SERVICE_ID: XRITServiceID = "UNREAL_ENGINE";

  /*
    Listener for a message indicating that an Unreal Engine instance with matching id has been launched 
    on this machine.
  */
  const onUEInitialized = function (configuration_id: string, settings: UnrealEngineSettings) {
    try {
      // Find matching Unreal Engine configuration
      const index = node.configurations.findIndex((c: XRITServicesConfig) => c.id === configuration_id);
      if (index == -1) throw new SocketException(`Unreal Engine is not registered with node '${node.id}'.`);

      // Parse the updated settings that have been provided by the Node and update this configuration's setting and status
      const parsed_settings = new UnrealEngineSettings(settings?.udp_unicast_endpoint, settings?.livelink);
      node.configurations[index]!.settings = parsed_settings;
      node.configurations[index]!.status = "SUCCESS";

      console.log(`\x1b[1m\x1b[4m\x1b[32mUnreal Engine and all related LiveLink streams initialized on ${node.machine_alias}!\x1b[0m`);
      console.log(inspect(parsed_settings, false, null, true));
      console.log();

      // Once we have set the configuration for Unreal Engine, we know that all streams have been created
      // as UE settings encapsulate streams, meaning on each successful configuration update all streams
      // are created.
      const ue_streams = stream_service.streams.filter((s: Stream) => s.target.configuration_id === configuration_id);
      ue_streams.forEach(s => {
        stream_service.setStreamAsPending(s.id, "TARGET", "PENDING");
      })

      const pending_ue_streams = stream_service.pending_streams.filter((s: Stream) => s.target.configuration_id === configuration_id);
      pending_ue_streams.forEach(s => {
        stream_service.onStreamTargetCreated(s.id)
        console.log(inspect(s, false, null, true));
        console.log();
      });

      // Need to update Unreal Engine nodes that new Unreal Engine instance has connected
      const ue_instance = transformNodeToUEInstance(node, false);
      const ue_nodes = node_service.getActiveNodesByService("UNREAL_ENGINE");
      ue_nodes.forEach(n => {
        if (n.id != node.id) {
          notifyOfInstanceConnect(n, ue_instance)
        }
      })

      InterfacesNamespace.emitConfigUpdate();
    } catch (e) {
      console.log(`ERROR: ${e}\n`)
    }
  };

  // Listener for a response to a heartbeat ping which is periodically sent to this Node to ensure
  // whether an Unreal Engine instance with matching id is running matches what is currently registered 
  // in the Orchestrator's state.
  const onUEHeartBeat = function (configuration_id: string, is_running: boolean) {
    try {
      onReceiveHeartBeatResponse(node, node_service, stream_service, configuration_id, is_running);
      InterfacesNamespace.emitConfigUpdate();
    } catch (e) {
      console.log(`ERROR: ${e}\n`)
    }
  };

  // Listener for message that Unreal Engine has been terminated. All associated streams are set
  // as offline.
  const onUETerminated = function (configuration_id: string) {
    try {
      var configuration = node.configurations.find(c => c.id === configuration_id);
      if (!configuration) throw new SocketException(`Received terminated message from configuration '${configuration_id}' but it is not registered on node ${node.id}`)

      configuration.status = "OFFLINE";
      stream_service.setConfigurationStreamsAsOffline(configuration_id)

      // Need to update Unreal Engine nodes that new Unreal Engine instance has disconnected
      const ue_instance = transformNodeToUEInstance(node, false);
      const ue_nodes = node_service.getActiveNodesByService("UNREAL_ENGINE");
      ue_nodes.forEach(n => {
        if (n.id != node.id) {
          notifyOfInstanceDisconnect(n, ue_instance)
        }
      })

      console.log(`\x1b[31mUnreal Engine has terminated on'${node.machine_alias}'\x1b[0m`);
      InterfacesNamespace.emitConfigUpdate();
    } catch (e) {
      console.log(`ERROR: ${e}\n`)
    }
  }

  // Listener for a message indicating there was an error with updating the Unreal Engine Plugin
  // configuration. The configuration status in the state is marked with an error.
  const onUEConfigUpdateError = function (ue_error: XRITServiceError) {
    try {
      const config = node.configurations.find((c: XRITServicesConfig) => c.software_id === UE_SERVICE_ID);
      if (!config) throw new SocketException(`Unreal Engine is not registered with node '${node.id}'`);

      config.settings = config;
      config.status = "ERROR";
      config.error = ue_error;
      InterfacesNamespace.emitConfigUpdate();

      console.log(`\x1b[4m\x1b[31mUnreal Engine configuration update to ${node.machine_alias} failed.\x1b[0m`);
      console.log(`\x1b[4m\x1b[31m${ue_error}`);
      console.log();
    } catch (e) {
      node.socket!.emit("node:unreal-engine:error", (e as SocketException).message);
    }
  };

  // Listener for an update indicating there was an updated plugin configuration, possibly from a
  // change made within Unreal Engine. 
  const onUEStatusUpdate = function (update_config: UnrealEngineSettings) {
    try {
      const index = node.configurations.findIndex((c: XRITServicesConfig) => c.software_id === UE_SERVICE_ID);
      if (index == -1) throw new SocketException(`Unreal Engine is not registered with node '${node.id}'.`);

      // Parse configuration to ensure correct formatting
      const settings = new UnrealEngineSettings(update_config.udp_unicast_endpoint, update_config.livelink);
      node.configurations[index]!.settings = settings;

      console.log(`\x1b[4m\x1b[35mRecieved new Unreal Engine configuration\x1b[0m`);
      console.log(inspect(settings, false, null, true));
      console.log();

      InterfacesNamespace.emitConfigUpdate();
    } catch (e) {
      node.socket!.emit("node:unreal-engine:error", (e as SocketException).message);
    }
  };

  // Listener for message indicating creating a stream source was successfully added to LiveLink
  const onUEStreamSourceAdded = function (stream_id: string) {
    try {
      // Given that Unreal Engine streams are also kept within the configuration settings (to provide ease of 
      // compatability with the Unreal Engine Plugin), both the stream object and the configuration settings
      // must be marked as successfully updated.
      const stream = stream_service.onStreamTargetCreated(stream_id);
      markConfigurationSuccessful(stream.target.configuration_id);

      console.log(`\x1b[4m\x1b[32mUnreal Engine Live Link Source added to ${node.machine_alias}!\x1b[0m`);
      console.log(inspect(stream, false, null, true));
      console.log();

      const ue_settings = node.getConfiguration(stream.target.configuration_id).settings;
      console.log(`\x1b[4m\x1b[32mNew Unreal Engine settings on ${node.machine_alias}!\x1b[0m`);
      console.log(inspect(ue_settings, false, null, true));
      console.log();

      InterfacesNamespace.emitConfigUpdate();
    } catch (e) {
      console.log(`ERROR: ${e}\n`)
    }
  }

  // Listener for a message indicating an Unreal Engine LiveLink source was successfully removed.
  // The stream and configurationa are marked as updated.
  const onUEStreamSourceRemoved = function (stream_id: string) {
    try {
      // Given that Unreal Engine streams are also kept within the configuration settings (to provide ease of 
      // compatability with the Unreal Engine Plugin), both the stream object and the configuration settings
      // must be marked as successfully updated.
      const stream = stream_service.onStreamTargetDeleted(stream_id);
      markConfigurationSuccessful(stream.target.configuration_id);

      console.log(`\x1b[4m\x1b[32m$nreal Engine Live Link Source removed to ${node.machine_alias}!\x1b[0m`);
      console.log(inspect(stream, false, null, true));
      console.log();

      const ue_settings = node.getConfiguration(stream.target.configuration_id).settings;
      console.log(`\x1b[4m\x1b[32mNew Unreal Engine settings on ${node.machine_alias}!\x1b[0m`);
      console.log(inspect(ue_settings, false, null, true));
      console.log();

      InterfacesNamespace.emitConfigUpdate();
    } catch (e) {
      console.log(`ERROR: ${e}\n`)
    }
  }

  // Listener for a message indicating there was an error updating an Unreal Engine LiveLink source
  // The stream and configurationa are marked as updated.
  const onUEStreamSourceError = function (stream_id: string) {
    try {
      const stream = stream_service.onStreamTargetError(stream_id);

      // Given that Unreal Engine streams are also kept within the configuration settings (to provide ease of 
      // compatability with the Unreal Engine Plugin), both the stream object and the configuration settings
      // must be marked as successfully updated.
      const ue_config = node.configurations.find(c => c.id === stream.target.configuration_id);
      if (!ue_config) throw new SocketException('Internal server error:no matching configuration exists on this machine.')
      ue_config.status = "ERROR"

      console.log(`\x1b[4m\x1b[32m$Error on Unreal Engine Live Link Source update to ${node.machine_alias}!\x1b[0m`);
      console.log(inspect(stream, false, null, true));
      console.log();
      InterfacesNamespace.emitConfigUpdate();
    } catch (e) {
      console.log(`ERROR: ${e}\n`)
    }
  }

  // Helper function to mark the Unreal Engine configuration as successful
  const markConfigurationSuccessful = function (config_id: string) {
    const ue_config = node.configurations.find(c => c.id === config_id);
    if (!ue_config) throw new SocketException('Internal server error:no matching configuration exists on this machine.')
    ue_config.status = "SUCCESS"
  }

  const onGetUnrealEngineInstances = function () {
    const nodes = node_service.getActiveNodesByService("UNREAL_ENGINE");
    const ue_instances = nodes.map(n => {
      var is_this_instance = n.id === node.id;
      return transformNodeToUEInstance(n, is_this_instance)
    })

    sendListOfUnrealEngineInstances(node, ue_instances)
  }

  const onBroadcastToUnrealEngineInstances = function (message: { name: string, body: any }) {
    const nodes = node_service.getActiveNodesByService("UNREAL_ENGINE");
    const ue_instance = transformNodeToUEInstance(node, false);
    nodes.forEach(n => { if (n.id != node.id) sendMessageFromUnrealEngineInstance(n, message, ue_instance); })
  }

  if (!node.socket) throw new SocketException(`Cannot create Unreal Engine handler until socket has been assigned.`)

  node.socket.on(`${UE_SERVICE_ID}:initialized`, onUEInitialized);
  node.socket.on(`${UE_SERVICE_ID}:heartbeat`, onUEHeartBeat);
  node.socket.on(`${UE_SERVICE_ID}:terminated`, onUETerminated);
  node.socket.on(`${UE_SERVICE_ID}:status`, onUEStatusUpdate);
  node.socket.on(`${UE_SERVICE_ID}:set_configuration_error`, onUEConfigUpdateError);
  node.socket.on(`${UE_SERVICE_ID}:stream-source-added`, onUEStreamSourceAdded);
  node.socket.on(`${UE_SERVICE_ID}:stream-source-removed`, onUEStreamSourceRemoved);
  node.socket.on(`${UE_SERVICE_ID}:stream-source-error`, onUEStreamSourceError);
  node.socket.on(`${UE_SERVICE_ID}:get-unreal-engine-instances`, onGetUnrealEngineInstances);
  node.socket.on(`${UE_SERVICE_ID}:broadcast-to-unreal-engine-instances`, onBroadcastToUnrealEngineInstances);
};