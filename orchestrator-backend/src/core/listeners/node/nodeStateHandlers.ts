import { Socket } from "socket.io";
import { Node } from "../../models/Node";
import { registerAuxiliaryNodeHandlers } from "../../../supported-services/node-listeners/registerAuxiliaryHandlers";
import InterfacesNamespace from "../../namespaces/InterfacesNamespace";
import { LabService } from "../../services/LabService";
import { NodesService } from "../../services/NodesService";
import { StreamsService } from "../../services/StreamsService";
import { SocketException } from "../../utils/SocketException";

export default (socket: Socket, lab_service: LabService, node_service: NodesService, streams_service: StreamsService) => {
    const onNodeIdentifer = async (id: string) => {
        var node: Node;

        try {
            node = node_service.initNode(id, socket);
            const permissions = lab_service.getLabPermissions(node);
            socket.emit("sign-in-success", { lab_name: permissions.lab?.name, permitted_labs: permissions.permitted_labs });
        } catch (e) {
            socket.emit('sign-in-error', 'This node is not registered with this Orchestrator configuration, please register first and then connect.')
            socket.disconnect();
            console.log(`\x1b[31m\x1b[1mConnection refused:\x1b[0m\x1b[31m${(e as SocketException).message}\x1b[0m\n`)
            return;
        }

        registerAuxiliaryNodeHandlers(node, node_service, streams_service);
        InterfacesNamespace.emitConfigUpdate();

        console.log(`\x1b[32m${node.machine_alias} \x1b[1mconnected.\x1b[0m`);
        console.log(`Number of nodes: ${node_service.nodes.filter((n) => n.is_online === true && n.role != "orchestrator").length}\n`);
        return node;
    };

    const onNodeIdentiferIPUpdated = (id: string, new_ip: string) => {
        const previous_node_settings = node_service.getNode(id)
        console.log(`\x1b[32mReceived message that ${previous_node_settings.machine_alias} reconnected with new IP address: ${new_ip}\x1b[0m\n`)
        const new_node_settings = node_service.onNodeIPChange(id, new_ip);

        const relevant_streams = streams_service.getStreamsByNode(id);
        relevant_streams.forEach(s => {
            if (s.source.node_id === id) {
                const target = node_service.getNode(s.target.node_id)
                console.log(`\x1b[34mRemoving old ${s.target.configuration_id} stream target to '${target.machine_alias}' associated with ${previous_node_settings.machine_alias} and recreating with new IP address.\x1b[0m\n`)
                streams_service.resolveRemoveStreamTarget(s, previous_node_settings, target)
                streams_service.resolveCreateStreamTarget(s, new_node_settings, target)
            } else {
                const source = node_service.getNode(s.source.node_id);
                console.log(`\x1b[34mRemoving ${s.source.configuration_id} stream source from '${source.machine_alias}' associated with ${previous_node_settings.machine_alias} and recreating with new IP address.\x1b[0m\n`)
                streams_service.resolveRemoveStreamSource(s, source, previous_node_settings)
                streams_service.resolveCreateStreamTarget(s, source, new_node_settings)
            }
        })
    }

    const onNodeDeregistered = (id: string) => {
        const node = node_service.onNodeDeregistered(id);
        console.log(`\x1b[33m${node.machine_alias} successfully deregistered\x1b[0m\n`)

        const node_streams = streams_service.getStreamsByNode(id);
        node_streams.forEach(s => {
            if (s.source.node_id === id) {
                const target = node_service.getNode(s.target.node_id)
                console.log(`\x1b[33mRemoving ${s.target.configuration_id} stream target to '${target.machine_alias}' associated with ${node.machine_alias}\x1b[0m\n`)
                streams_service.resolveRemoveStreamTarget(s, node, target)
            } else {
                const source = node_service.getNode(s.source.node_id);
                console.log(`\x1b[33mRemoving ${s.source.configuration_id} stream source from '${source.machine_alias}' associated with ${node.machine_alias}\x1b[0m\n`)
                streams_service.resolveRemoveStreamSource(s, source, node)
            }
        })

        InterfacesNamespace.emitConfigUpdate();
    }

    socket.on("node-identifier", onNodeIdentifer);
    socket.on("node-identifier-ip-updapted", onNodeIdentiferIPUpdated);
    socket.on("node-deregistered", onNodeDeregistered)
}