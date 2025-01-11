import { Socket } from "socket.io";
import { SocketException } from "../../utils/SocketException";
import { XRITServiceID } from "../../../supported-services/models/XRITServiceConfig";
import InterfacesNamespace from "../../namespaces/InterfacesNamespace";
import { INode } from "../../models/Node";
import { NodesService } from "../../services/NodesService";
import { StreamsService } from "../../services/StreamsService";
import { inspect } from "util";

/*
  Listeners which handle requests for management of Nodes within an XR-IT network. These requests 
  should be made from Orchestrator front-end interfaces who are connected to the Interfaces Namespace.
  See more on this in: src > core > namespaces > InterfacesNamespace.ts
*/
export default (socket: Socket, node_service: NodesService, stream_service: StreamsService) => {

    /*
        This function launches the deregistration process of a Node. Here, a deregistration 
        request is forwarded to the Node which then executes necessary operations on its machine. 
        Only once this success message is received by the Orchestration can deregistration logic 
        be finalized (such as removing streams). 
        
        This logic can be found in the "onNodeDeregistered" function at:
        src > core > listeners > node > nodeStateHandlers.ts
    */
    const onDeregisterNode = function (id: string) {
        try {
            console.log(`\x1b[36mReceived request to remove node from this Orchestrator.\x1b[0m\n`)
            if (!id) throw new SocketException(`Must provide the id of the Node to update.`)

            const node_pending_streams = stream_service.getPendingStreamsByNode(id);
            const node = node_service.getNode(id);

            if (!node.is_online && node_pending_streams.length > 0) {
                throw new SocketException(`Cannot update node while node or relevant stream updates are pending, cancelling update.`);
            }

            node_service.deregisterNode(id);
            console.log(`\x1b[4m\x1b[33mSent request to ${node.machine_alias} to deregister from this network.'\x1b[0m\n`)
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    // Updates the settings of a node. If this change requires an IP change, then
    // that request is sent to the corresponding Node for relevant operations on the machine.
    const onUpdateNodeSettings = function (id: string, node_settings: INode) {
        try {
            console.log(`\x1b[36mReceived request to update node settings.\x1b[0m\n`)

            if (!id) throw new SocketException(`Must provide the id of the Node to update.`)
            if (!node_settings) throw new SocketException(`Must provide the Node configuration settings to update.`)

            const node = node_service.getNode(id);
            const node_pending_streams = stream_service.getPendingStreamsByNode(id);
            if (!node.is_online && node_pending_streams.length > 0) {
                throw new SocketException(`Cannot update node while node is offline or stream updates are pending, cancelling update.`);
            }

            const updated_node = node_service.updateNode(id, node_settings);

            console.log(`\x1b[4m\x1b[32mInitial update operation on ${node.machine_alias} successful. If IP address was updated, waiting on response from machine.'\x1b[0m\n`)
            console.log(`${inspect(updated_node, false, null, true)}`)
            console.log()

            InterfacesNamespace.emitConfigUpdate();
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    /*
        Registers a new service with a Node. Accepts the node id and service id to be added, additionally
        settings for the service may be set on creation, otherwise a default service is created. The Orchestrator 
        forwards this message to the corresponding Node so that the service is initialized.
    */
    const onAddNodeService = function (node_id: string, service_id: XRITServiceID, settings?: any) {
        try {
            const configuration = node_service.addNodeService(node_id, service_id, settings)
            const node = node_service.getNode(node_id);

            console.log(`\x1b[36mReceived request to add ${service_id} to ${node.machine_alias}'\x1b[0m\n`);

            // If node has active socket, this means it will be launched so we need to set streams as pending.
            if (node.socket) {
                stream_service.setConfigurationStreamsAsPending(node.id, configuration.id)
            }

            InterfacesNamespace.emitConfigUpdate();

            console.log(`\x1b[32m${service_id} added to Node '${node.machine_alias}'!\x1b[0m\n`);
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    /*
        Listener for removing service from a Node. Accepts the node id and configuration id of the service to be removed.
        On success, all related streams / pending streams are removed from the state.
    */
    const onRemoveNodeService = function (node_id: string, configuration_id: string) {
        try {
            const has_pending_streams = stream_service.getPendingStreamsByConfiguration(configuration_id).length > 0;
            if (has_pending_streams) throw new SocketException('Cannot remove service as it has some pending streams. Please wait until they are complete.')

            const node = node_service.removeNodeService(node_id, configuration_id)
            console.log(`\x1b[36mReceived request to remove service configuration with id '${configuration_id}' from ${node.machine_alias}'\x1b[0m\n`);

            // After removing the Node, we have to clean up all relevant streams.
            // For now we only send requests to Nodes to delete streams in softwares whose configurations
            // remain in XR-IT (i.e. after removing MVN from a Node, we don't then send a message to that Node 
            // to remove all streams within MVN. Rather we send a request to any Node who may be receiving streams
            // from MVN such as in Unreal Engine.
            stream_service.streams.forEach(s => {
                if (s.source.configuration_id === configuration_id) {
                    // Source in this stream object is the deleted service. 
                    // Mark stream source status as deleted.
                    s.source.status = "DELETED"

                    // Send request to target to remove any accepted streams from the deleted service.
                    const target_node = node_service.getNode(s.target.node_id);
                    stream_service.setStreamAsPending(s.id, "TARGET", "PENDING_DELETE")
                    stream_service.removeStreamTarget(s, node, target_node)

                    console.log(`\x1b[36mRemoving stream from ${node.machine_alias} to ${target_node.machine_alias} associated with removal of configuration ${configuration_id}\n`);
                } else if (s.target.configuration_id === configuration_id) {
                    // Target in this stream object is the deleted service. 
                    // Mark stream target status as deleted.
                    s.target.status = "DELETED"

                    // Send request to source to remove any streams sent to the deleted service.
                    const source_node = node_service.getNode(s.source.node_id)
                    stream_service.setStreamAsPending(s.id, "SOURCE", "PENDING_DELETE")
                    stream_service.removeStreamSource(s, source_node, node)

                    console.log(`\x1b[36mRemoving stream from ${source_node.machine_alias} to ${node.machine_alias} associated with removal of configuration ${configuration_id}\n`);

                }
            })

            InterfacesNamespace.emitConfigUpdate();

            console.log(`\x1b[33mRemoved service configuration with id '${configuration_id}' from ${node.machine_alias}\x1b[0m\n`);
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    /*
        Listener for updating a service in a Node. Accepts the node id and configuration id of the service to update.
        If necessary, this update request is forwarded to corresponding machines to execute update operations
        at the software level.
    */
    const onUpdateNodeService = function (node_id: string, configuration_id: string, settings: any) {
        try {
            console.log(`\x1b[36mReceived request to update service configuration with id '${configuration_id}' from node '${node_id}'\x1b[0m`);
            console.log(settings)
            console.log()

            const node = node_service.updateNodeService(node_id, configuration_id, settings);
            const config = node.getConfiguration(configuration_id);

            InterfacesNamespace.emitConfigUpdate();

            console.log(`\x1b[32mUpdated ${config.software_id} service configuration on ${node.machine_alias}\x1b[0m\n`);
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    socket.on("remove-node", onDeregisterNode);
    socket.on("update-node-settings", onUpdateNodeSettings);
    socket.on("add-node-service", onAddNodeService);
    socket.on("update-node-service", onUpdateNodeService);
    socket.on("remove-node-service", onRemoveNodeService);
};
