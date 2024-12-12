import { Socket } from "socket.io";
import { SocketException } from "../../utils/SocketException";
import { XRITServiceID, XRITServicesConfig } from "../../../supported-services/models/XRITServiceConfig";
import InterfacesNamespace from "../../namespaces/InterfacesNamespace";
import { setUnrealEngineConfiguration } from "../../../supported-services/services/UnrealEngineService";
import { UnrealEngineSettings } from "../../../supported-services/models/UnrealEngine";
import { INode } from "../../models/Node";
import { NodesService } from "../../services/NodesService";
import { StreamsService } from "../../services/StreamsService";
import { inspect } from "util";
import { resolveRemoveStreamSource, resolveRemoveStreamTarget } from "../../../supported-services/services/resolveServiceOperation";

export default (socket: Socket, node_service: NodesService, stream_service: StreamsService) => {
    const onUpdateNodeSettings = function (id: string, node_settings: INode) {
        try {
            console.log(`\x1b[36mReceived request to update node settings.\x1b[0m\n`)

            if (!id) throw new SocketException(`Must provide the id of the Node to update.`)
            if (!node_settings) throw new SocketException(`Must provide the Node configuration settings to update.`)

            const node_pending_streams = stream_service.getPendingStreamsByNode(id);
            if (node_pending_streams.length > 0) {
                throw new SocketException(`Cannot update node while stream updates are pending, cancelling update.`);
            }

            const node = node_service.updateNode(id, node_settings);

            console.log(`\x1b[4m\x1b[32mInitial update operation on ${node.machine_alias} successful. If IP address was updated, waiting on response from machine.'\x1b[0m\n`)
            console.log(`${inspect(node, false, null, true)}`)
            console.log()
            InterfacesNamespace.emitConfigUpdate();
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    const onDeregisterNode = function (id: string) {
        try {
            console.log(`\x1b[36mReceived request to remove node from this Orchestrator.\x1b[0m\n`)
            if (!id) throw new SocketException(`Must provide the id of the Node to update.`)

            const node_pending_streams = stream_service.getPendingStreamsByNode(id);
            if (node_pending_streams.length > 0) {
                throw new SocketException(`Cannot update node while stream updates are pending, cancelling update.`);
            }

            const node = node_service.deregisterNode(id);
            console.log(`\x1b[4m\x1b[33mSent request to ${node.machine_alias} to deregister from this network.'\x1b[0m\n`)
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    /*
        Listener for registering a new service with a Node. Accepts the node id and service id to be added, additionally
        settings for the service may be set on creation, otherwise a default service is created. The Orchestrator then
        sends a message to the corresponding Node to launch the service.
    */
    const onAddNodeService = function (node_id: string, service_id: XRITServiceID, settings?: any) {
        try {
            const node = node_service.getNode(node_id);
            console.log(`\x1b[36mReceived request to add ${service_id} to ${node.machine_alias}'\x1b[0m\n`);

            // Only one Unreal Engine configuration per node.
            if (service_id === "UNREAL_ENGINE" && node.configurations.some(c => c.software_id === "UNREAL_ENGINE")) {
                throw new SocketException(`${node.machine_alias} already has an Unreal Engine configuration registered and there can only be one at a time.`)
            }

            const configuration = new XRITServicesConfig({
                software_id: service_id,
                status: "PENDING",
                settings: settings
            });

            node.configurations.push(configuration);

            if (node.socket) {
                node_service.launchService(node, configuration)
                stream_service.setConfigurationStreamsAsPending(node.id, configuration.id)
            }

            InterfacesNamespace.emitConfigUpdate();

            console.log(`\x1b[32m${service_id} added to Node '${node.machine_alias}'!\x1b[0m\n`);
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    /*
        Listener for remove a service from a Node. Accepts the node id and configuration id of the service to be removed.
        Once successful, all related streams / pending streams are removed from the state.
    */
    const onRemoveNodeService = function (node_id: string, configuration_id: string) {
        try {
            const node = node_service.getNode(node_id);
            console.log(`\x1b[36mReceived request to remove service configuration with id '${configuration_id}' from ${node.machine_alias}'\x1b[0m\n`);

            if (!node.configurations.some(c => c.id === configuration_id)) throw new SocketException(`No configuration with id '${configuration_id}' exists on Node '${node.id}' `)
            const has_pending_streams = stream_service.getPendingStreamsByConfiguration(configuration_id).length > 0;
            if (has_pending_streams) throw new SocketException('Cannot remove service as it has some pending streams. Please wait until they are complete.')

            node.configurations = node.configurations.filter(c => c.id != configuration_id);

            // For now we do only remove streams from the configuration which remains in XR-IT
            // (i.e. after removing MVN from a Node, we don't then send a message to that Node to remove all 
            // streams within MVN, just those receiving streams from MVN as well as remove all streams and pending streams from the Orchestrator state.
            stream_service.streams.forEach(s => {
                if (s.source.configuration_id === configuration_id) {
                    s.source.status = "DELETED"
                    const target_node = node_service.getNode(s.target.node_id);
                    console.log(`\x1b[36mRemoving stream from ${node.machine_alias} to ${target_node.machine_alias} associated with removal of configuration ${configuration_id}\n`);
                    stream_service.setStreamAsPending(s.id, "TARGET", "PENDING_DELETE")
                    resolveRemoveStreamTarget(s, node, target_node)
                } else if (s.target.configuration_id === configuration_id) {
                    s.target.status = "DELETED"
                    const source_node = node_service.getNode(s.source.node_id)
                    console.log(`\x1b[36mRemoving stream from ${source_node.machine_alias} to ${node.machine_alias} associated with removal of configuration ${configuration_id}\n`);
                    stream_service.setStreamAsPending(s.id, "SOURCE", "PENDING_DELETE")
                    resolveRemoveStreamSource(s, source_node, node)
                }
            })

            InterfacesNamespace.emitConfigUpdate();

            console.log(`\x1b[33mRemoved service configuration with id '${configuration_id}' from ${node.machine_alias}\x1b[0m\n`);
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    /*
        Listener for remove a service from a Node. Accepts the node id and configuration id of the service to be removed.
        Once successful, all related streams / pending streams are removed from the state.
    */
    const onUpdateNodeService = function (node_id: string, configuration_id: string, settings: any) {
        try {
            const node = node_service.getNode(node_id);

            console.log(`\x1b[36mReceived request to update service configuration with id '${configuration_id}' from ${node.machine_alias}\x1b[0m`);
            console.log(settings)
            console.log()

            var configuration_index = node.configurations.findIndex(c => c.id === configuration_id)
            if (configuration_index < 0) throw new SocketException(`No configuration with id '${configuration_id}' exists on ${node.machine_alias}`)
            if (node.configurations[configuration_index]?.status === "PENDING" || node.configurations[configuration_index]?.status === "UPDATE_PENDING")
                throw new SocketException(`Cannot update ${node.configurations[configuration_index]!.software_id} on ${node.machine_alias} as it is currently in pending state.`)

            const new_configuration = new XRITServicesConfig({
                id: node.configurations[configuration_index]!.id,
                software_id: node.configurations[configuration_index]!.software_id,
                status: "PENDING",
                settings: settings
            });

            switch (node.configurations[configuration_index]!.software_id) {
                // For these softwares we simply update settings in XR-IT configuration state, no need for additional commands
                case "MVN":
                case "OPTITRACK":
                    new_configuration.status = node.configurations[configuration_index]!.status;
                    node.configurations[configuration_index] = new_configuration
                    break
                case "ULTRAGRID_SEND":
                case "ULTRAGRID_RECEIVE":
                    break
                    // TO DO - UPDATE STREAMS ONCE UPDATE IS COMPLETE
                // If Unreal Engine is online, we ust send update to Unreal Engine so that settings can be updated in software
                // Otherwise, we simply update the configuration as above.
                case "UNREAL_ENGINE":
                    if (node.configurations[configuration_index]!.status === "OFFLINE") {
                        new_configuration.status = node.configurations[configuration_index]!.status;
                        node.configurations[configuration_index] = new_configuration
                    } else {
                        setUnrealEngineConfiguration(node, new_configuration.settings as UnrealEngineSettings)
                    }
                    break;
                default:
                    throw new SocketException(`${configuration_id} is not a valid software ID or does not support settings updates.`)
            }

            InterfacesNamespace.emitConfigUpdate();
            console.log(`\x1b[32mUpdated ${node.configurations[configuration_index]!.software_id} service configuration on ${node.machine_alias}\x1b[0m\n`);
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    socket.on("update-node-settings", onUpdateNodeSettings);
    socket.on("remove-node", onDeregisterNode);
    socket.on("add-node-service", onAddNodeService);
    socket.on("update-node-service", onUpdateNodeService);
    socket.on("remove-node-service", onRemoveNodeService);
};
