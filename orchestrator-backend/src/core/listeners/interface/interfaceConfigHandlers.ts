import { Socket } from "socket.io";
import { SocketException } from "../../utils/SocketException";
import { ConfigurationService, getConfiguration, saveConfiguration, serializeState } from "../../services/ConfigurationService";
import { LabService } from "../../services/LabService";
import { NodesService } from "../../services/NodesService";
import { SoftEtherServer } from "../../services/SoftEtherService";
import { StreamsService } from "../../services/StreamsService";
import InterfacesNamespace from "../../namespaces/InterfacesNamespace";

export default (socket: Socket, config_service: ConfigurationService, vpn: SoftEtherServer, lab_service: LabService, node_service: NodesService, stream_service: StreamsService) => {
  const onGetOrchestratorConfig = function () {
    socket.emit("config:orchestrator-config", serializeState(config_service, vpn, lab_service.labs, node_service.nodes, stream_service.streams, stream_service.pending_streams));
  };

  const onSaveOrchestratorConfig = function () {
    try {
      console.log('\x1b[34mReceived a command to save the Orchestrator configuration.\x1b[0m\n')
      saveConfiguration(config_service, vpn, lab_service.labs, node_service.nodes, stream_service.streams);
      socket.emit("config:orchestrator-config-saved", getConfiguration(config_service.id));
    } catch (e) {
      socket.emit('error', (e as SocketException).message);
    }
  }

  const onUpdateConfigurationName = function (configuration_name: string) {
    try {
      console.log(`\x1b[36mReceived request to update configuration name\x1b[0m\n`)

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
