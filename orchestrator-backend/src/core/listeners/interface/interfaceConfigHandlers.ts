import { Socket } from "socket.io";
import { SocketException } from "../../utils/SocketException";
import { ConfigurationService, getConfiguration, saveConfiguration, serializeState } from "../../services/ConfigurationService";
import { LabService } from "../../services/LabService";
import { NodesService } from "../../services/NodesService";
import { SoftEtherServer } from "../../services/SoftEtherService";
import { StreamsService } from "../../services/StreamsService";
import InterfacesNamespace from "../../namespaces/InterfacesNamespace";

/*
  Listeners which handle requests for configuration management. These requests should be 
  made from Orchestrator front-end interfaces who are connected to the Interfaces Namespace.
  See more on this in: src > core > namespaces > InterfacesNamespace.ts
*/
export default (socket: Socket, config_service: ConfigurationService, vpn: SoftEtherServer, lab_service: LabService, node_service: NodesService, stream_service: StreamsService) => {
  
  // Returns the current state of an active Orchestrator
  const onGetOrchestratorConfig = function () {
    try {
      if(!ConfigurationService.getCurrentConfigurationId()) {
        throw new SocketException(`Cannot provide Orchestrator state as no configuration is active.`)
      }

      socket.emit("config:orchestrator-config", serializeState(config_service, vpn, lab_service.labs, node_service.nodes, stream_service.streams, stream_service.pending_streams));
    } catch(e) {
      socket.emit(`error`, (e as Error).message)
    }
  };

  // Saves the current state of the active Orchestrator to the configuration file whose id matches.
  // If no file exists, a new file is created. Configurations are saved to the 'config' folder in root.
  const onSaveOrchestratorConfig = function () {
    try {
      console.log('\x1b[34mReceived a command to save the Orchestrator configuration.\x1b[0m\n')

      if(!ConfigurationService.getCurrentConfigurationId()) {
        throw new SocketException(`Cannot save configuration as no Orchestrator is active.`)
      }

      saveConfiguration(config_service, vpn, lab_service.labs, node_service.nodes, stream_service.streams);
      socket.emit("config:orchestrator-config-saved", getConfiguration(config_service.id));
    } catch (e) {
      socket.emit('error', (e as SocketException).message);
    }
  }

  // Changes the name of the active configuration to a provided string.
  // Note: configuration file is not updated until the onSaveOrchestratorConfig is executed.
  const onUpdateConfigurationName = function (configuration_name: string) {
    try {
      console.log(`\x1b[36mReceived request to update configuration name\x1b[0m\n`)

      if(!ConfigurationService.getCurrentConfigurationId()) throw new SocketException(`Cannot update configuration name as no Orchestrator is active.`)
      if(!configuration_name) throw new SocketException('Configuration name cannot be empty.\x1b[0m')

      config_service.configuration_name = configuration_name;

      console.log(`\x1b[32mSuccessfully updated configuration name to '${configuration_name}.'\x1b[0m\n`)
      InterfacesNamespace.emitConfigUpdate();
    } catch (e) {
      socket.emit('error', (e as SocketException).message);
    }
  }

  socket.on("update-configuration-name", onUpdateConfigurationName);
  socket.on("config:get-orchestrator-config", onGetOrchestratorConfig);
  socket.on("config:save-orchestrator-config", onSaveOrchestratorConfig);
};
