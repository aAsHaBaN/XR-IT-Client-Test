import { Socket } from "socket.io";
import { Node } from "../../models/Node";
import { registerAuxiliaryNodeHandlers } from "../../../supported-services/node-listeners/registerAuxiliaryHandlers";
import InterfacesNamespace from "../../namespaces/InterfacesNamespace";
import { LabService } from "../../services/LabService";
import { NodesService } from "../../services/NodesService";
import { StreamsService } from "../../services/StreamsService";
import { SocketException } from "../../utils/SocketException";

/*
  Listeners which handles requests and receive updates regarding a Node's state within XR-IT
  These requests should be made from an XR-IT Node connected to the Nodes Namespace.
  See more on this in: src > core > namespaces > NodesNamespace.ts
*/
export default (socket: Socket, lab_service: LabService, node_service: NodesService, streams_service: StreamsService) => {
    
    // Receives an identifier which identifies a Node which is registered with the active XR-IT configuration.
    // This 'node-identifier' request should be sent as soon as the Node connects to the NodeNamespaces socket.
    // Using this information, the Orchestrator is able to correctly initialize the softwares and streams associated
    // with the node in the configuration. 
    const onNodeIdentifer = async (id: string) => {
        var node: Node;

        try {
            node = node_service.initNode(id, socket);
            
            // On successful sign in, the permissions of the User / Node are sent alongside a sign in success message
            const permissions = lab_service.getLabPermissions(node);
            socket.emit("sign-in-success", { lab_name: permissions.lab?.name, permitted_labs: permissions.permitted_labs });
        } catch (e) {
            // TO DO: For now we assume that any error associated with an unsuccessful sign in means that the Node is not
            // registered with the active Orchestrator. Of course, this is not the case and can be due to an internal server error.
            // Once error handling is implemented, this logic needs to be updated accordingly.
            socket.emit('sign-in-error', 'This node is not registered with this Orchestrator configuration, please register first and then connect.')
            socket.disconnect();
            console.log(`\x1b[31m\x1b[1mConnection refused:\x1b[0m\x1b[31m${(e as SocketException).message}\x1b[0m\n`)
            return;
        }

        // Registers listeners which handle messages from this Node's socket regarding 
        // auxilliary services (aka softwares supported by XR-IT such as Unreal Engine).
        registerAuxiliaryNodeHandlers(node, node_service, streams_service);
        InterfacesNamespace.emitConfigUpdate();

        console.log(`\x1b[32m${node.machine_alias} \x1b[1mconnected.\x1b[0m`);
        console.log(`Number of nodes: ${node_service.nodes.filter((n) => n.is_online === true && n.role != "orchestrator").length}\n`);
        return node;
    };

    // Similar as above, this listener should be executed right after a Node connects to the XR-IT
    // network. In this case though, this is a 'reconnect' where the Node has just changed its IP
    // address, likely as a result of a Node update (see onUpdateNodeSettings in interfaceNodeHandlers.ts). 
    // Here we must remove all streams associated with this Node and recreate them with the correct 
    // IP address.
    const onNodeIdentiferIPUpdated = (id: string, new_ip: string) => {
        const node = node_service.getNode(id)
        console.log(`\x1b[32mReceived message that ${node.machine_alias} reconnected with new IP address: ${new_ip}\x1b[0m\n`)
        
        const previous_node_settings = structuredClone(node);
        node.local_ip = new_ip;

        const relevant_streams = streams_service.getStreamsByNode(id);
        relevant_streams.forEach(s => {
            if (s.source.node_id === id) {
                const target = node_service.getNode(s.target.node_id)
                console.log(`\x1b[34mRemoving old ${s.target.configuration_id} stream target to '${target.machine_alias}' associated with ${previous_node_settings.machine_alias} and recreating with new IP address.\x1b[0m\n`)
                streams_service.removeStreamTarget(s, previous_node_settings, target)
                streams_service.createStreamTarget(s, node, target)
            } else {
                const source = node_service.getNode(s.source.node_id);
                console.log(`\x1b[34mRemoving ${s.source.configuration_id} stream source from '${source.machine_alias}' associated with ${previous_node_settings.machine_alias} and recreating with new IP address.\x1b[0m\n`)
                streams_service.removeStreamSource(s, source, previous_node_settings)
                streams_service.createStreamTarget(s, source, node)
            }
        })
    }

    // This function will execute AFTER a Node has deregistered from XR-IT, likely as a result of
    // a delete Node request from the front end (see onDeregisterNode in interfaceNodeHandlers.ts).
    // This function will delete the Node and any associated streams from the state.
    const onNodeDeregistered = (id: string) => {
        const node = node_service.onNodeDeregistered(id);
        console.log(`\x1b[33m${node.machine_alias} successfully deregistered\x1b[0m\n`)

        const node_streams = streams_service.getStreamsByNode(id);
        node_streams.forEach(s => {
            if (s.source.node_id === id) {
                const target = node_service.getNode(s.target.node_id)
                console.log(`\x1b[33mRemoving ${s.target.configuration_id} stream target to '${target.machine_alias}' associated with ${node.machine_alias}\x1b[0m\n`)
                streams_service.removeStreamTarget(s, node, target)
            } else {
                const source = node_service.getNode(s.source.node_id);
                console.log(`\x1b[33mRemoving ${s.source.configuration_id} stream source from '${source.machine_alias}' associated with ${node.machine_alias}\x1b[0m\n`)
                streams_service.removeStreamSource(s, source, node)
            }
        })

        InterfacesNamespace.emitConfigUpdate();
    }

    socket.on("node-identifier", onNodeIdentifer);
    socket.on("node-identifier-ip-updated", onNodeIdentiferIPUpdated);
    socket.on("node-deregistered", onNodeDeregistered)
}