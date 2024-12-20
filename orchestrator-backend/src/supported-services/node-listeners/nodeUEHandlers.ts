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


export default (node: Node, node_service: NodesService, stream_service: StreamsService) => {
  const UE_SERVICE_ID: XRITServiceID = "UNREAL_ENGINE";

  const onUEInitialized = function (configuration_id: string, settings: UnrealEngineSettings) {
    try {
      const index = node.configurations.findIndex((c: XRITServicesConfig) => c.id === configuration_id);
      if (index == -1) throw new SocketException(`Unreal Engine is not registered with node '${node.id}'.`);

      const parsed_settings = new UnrealEngineSettings(settings?.udp_unicast_endpoint, settings?.livelink);
      node.configurations[index]!.settings = parsed_settings;
      node.configurations[index]!.status = "SUCCESS";

      console.log(`\x1b[1m\x1b[4m\x1b[32mUnreal Engine and all related LiveLink streams initialized on ${node.machine_alias}!\x1b[0m`);
      console.log(inspect(parsed_settings, false, null, true));
      console.log();

      // Once we have set the configuration for Unreal Engine, we know that all streams have been created, as the Unreal Engine
      // Settings object contains all streams.
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

      InterfacesNamespace.emitConfigUpdate();
    } catch (e) {
      console.log(`ERROR: ${e}\n`)
    }
  };

  const onUEHeartBeat = function (configuration_id: string, is_running: boolean) {
    try {
      onReceiveHeartBeatResponse(node, node_service, stream_service, configuration_id, is_running);
      InterfacesNamespace.emitConfigUpdate();
    } catch (e) {
      console.log(`ERROR: ${e}\n`)
    }
  };

  const onUETerminated = function (configuration_id: string) {
    try {
      var configuration = node.configurations.find(c => c.id === configuration_id);
      if (!configuration) throw new SocketException(`Received terminated message from configuration '${configuration_id}' but it is not registered on node ${node.id}`)

      configuration.status = "OFFLINE";
      stream_service.setConfigurationStreamsAsOffline(configuration_id)

      console.log(`\x1b[31mUnreal Engine has terminated on'${node.machine_alias}'\x1b[0m`);
      InterfacesNamespace.emitConfigUpdate();
    } catch (e) {
      console.log(`ERROR: ${e}\n`)
    }
  }

  /* 
    Given the structure of the Unreal Engine configuration, we are storing it in
    its entirety within the XRITConfigurationSettings, including some duplicated
    information that will be stored as a Stream in the Orchestrator state. With this,
    regardless of whether there is a corresponding pending stream update, we update 
    the Node with the new Unreal Engine configuration 
  */
  const onUEConfigUpdateSuccess = function (ue_settings: UnrealEngineSettings) {
    try {
      const config = node.configurations.find((c: XRITServicesConfig) => c.software_id === UE_SERVICE_ID);
      if (!config) throw new SocketException(`Unreal Engine is not registered with node '${node.id}'`);

      config.settings = new UnrealEngineSettings(ue_settings.udp_unicast_endpoint, ue_settings.livelink);
      config.status = "SUCCESS";
      config.error = undefined;

      InterfacesNamespace.emitConfigUpdate();

      console.log(`\x1b[1m\x1b[32mUnreal Engine configuration update to ${node.machine_alias} successful!\x1b[0m\n`);
      console.log(`\x1b[4m\x1b[35mRecieved new Unreal Engine configuration\x1b[0m`);
      console.log(inspect(ue_settings, false, null, true));
      console.log();
    } catch (e) {
      node.socket!.emit("node:unreal-engine:error", (e as SocketException).message);
    }
  };

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

  const onUEStatusUpdate = function (update_config: any) {
    try {
      const index = node.configurations.findIndex((c: XRITServicesConfig) => c.software_id === UE_SERVICE_ID);
      if (index == -1) throw new SocketException(`Unreal Engine is not registered with node '${node.id}'.`);

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

  const onUEStreamSourceAdded = function (stream_id: string) {
    try {
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

  const onUEStreamSourceRemoved = function (stream_id: string) {
    try {
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

  const onUEStreamSourceError = function (stream_id: string) {
    try {
      const stream = stream_service.onStreamTargetError(stream_id);

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

  const markConfigurationSuccessful = function (config_id: string) {
    const ue_config = node.configurations.find(c => c.id === config_id);
    if (!ue_config) throw new SocketException('Internal server error:no matching configuration exists on this machine.')
    ue_config.status = "SUCCESS"
  }

  if (!node.socket) throw new SocketException(`Cannot create Unreal Engine handler until socket has been assigned.`)

  node.socket.on(`${UE_SERVICE_ID}:initialized`, onUEInitialized);
  node.socket.on(`${UE_SERVICE_ID}:heartbeat`, onUEHeartBeat);
  node.socket.on(`${UE_SERVICE_ID}:terminated`, onUETerminated);
  node.socket.on(`${UE_SERVICE_ID}:status`, onUEStatusUpdate);
  node.socket.on(`${UE_SERVICE_ID}:set_configuration_success`, onUEConfigUpdateSuccess);
  node.socket.on(`${UE_SERVICE_ID}:set_configuration_error`, onUEConfigUpdateError);
  node.socket.on(`${UE_SERVICE_ID}:stream-source-added`, onUEStreamSourceAdded);
  node.socket.on(`${UE_SERVICE_ID}:stream-source-removed`, onUEStreamSourceRemoved);
  node.socket.on(`${UE_SERVICE_ID}:stream-source-error`, onUEStreamSourceError);
};