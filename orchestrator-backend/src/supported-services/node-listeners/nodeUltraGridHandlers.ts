import { Socket } from "socket.io";
import { XRITServiceID, XRITServicesConfig } from "../models/XRITServiceConfig";
import { SocketException } from "../../core/utils/SocketException";
import { Node } from "../../core/models/Node";
import InterfacesNamespace from "../../core/namespaces/InterfacesNamespace";
import { NodesService } from "../../core/services/NodesService";
import { StreamsService } from "../../core/services/StreamsService";
import { onReceiveHeartBeatResponse } from "../../core/services/HeartbeatService";
import { Stream } from "../../core/models/Stream";
import { resolveCreateStreamSource, resolveCreateStreamTarget } from "../services/resolveServiceOperation";

const ULTRAGRID_SEND_SERVICE_ID: XRITServiceID = "ULTRAGRID_SEND"
const ULTRAGRID_RECEIVE_SERVICE_ID: XRITServiceID = "ULTRAGRID_RECEIVE"

// Listener for updates from Nodes regarding service updates, including the initialization, heartbeat and termination of services.
export default (node: Node, node_service: NodesService, stream_service: StreamsService) => {
    const onUltraGridSendInitialized = function (configuration_id: string) {
        var configuration = node.configurations.find((c: XRITServicesConfig) => c.id === configuration_id);
        if (!configuration) throw new SocketException(`Internal server error: no configuration with id '${configuration_id}' is registered on node '${node.id}'`)
        configuration.status = "SUCCESS";

        console.log(`\x1b[1m\x1b[32mUltra Grid Send initialized on ${node.machine_alias}!\x1b[0m\n`);

        // Once the service is launched, we want to launch all of the streams related to UltraGrid
        const ug_send_streams = stream_service.streams.filter((s: Stream) => s.source.configuration_id === configuration_id);
        ug_send_streams.forEach(s => {
          stream_service.setStreamAsPending(s.id, "SOURCE", "PENDING");
        })

        // The reason we create a different list is that there may already be pending streams for this instance that never finished
        const pending_ug_send_streams = stream_service.pending_streams.filter((s: Stream) => s.source.configuration_id === configuration!.id);
        if (pending_ug_send_streams.length > 0) console.log(`\x1b[34mCreating ${pending_ug_send_streams.length} preconfigured MVN stream targets on ${node.machine_alias}...\x1b[0m\n`);

        pending_ug_send_streams.forEach(s => {
            const target_node = node_service.getNode(s.target.node_id);
            resolveCreateStreamSource(s, node, target_node);
        });


        InterfacesNamespace.emitConfigUpdate();
    };

    const onUltraGridReceiveInitialized = function (configuration_id: string) {
        var configuration = node.configurations.find((c: XRITServicesConfig) => c.id === configuration_id);
        if (!configuration) throw new SocketException(`Internal server error: no configuration with id '${configuration_id}' is registered on node '${node.id}'`)
        configuration.status = "SUCCESS";

        console.log(`\x1b[1m\x1b[32mUltra Grid Receive initialized on ${node.machine_alias}!\x1b[0m\n`);

        // Once the service is launched, we want to launch all of the streams related to UltraGrid
        const ug_receive_streams = stream_service.streams.filter((s: Stream) => s.source.configuration_id === configuration_id);
        ug_receive_streams.forEach(s => {
          stream_service.setStreamAsPending(s.id, "TARGET", "PENDING");
        })

        const pending_ug_receive_streams = stream_service.pending_streams.filter((s: Stream) => s.source.configuration_id === configuration!.id);
        if (pending_ug_receive_streams.length > 0) console.log(`\x1b[34mCreating ${pending_ug_receive_streams.length} preconfigured MVN stream targets on ${node.machine_alias}...\x1b[0m\n`);

        pending_ug_receive_streams.forEach(s => {
            const source_node = node_service.getNode(s.source.node_id)
            resolveCreateStreamTarget(s, source_node, node);
        });

        InterfacesNamespace.emitConfigUpdate();
    };


    const onUltraGridHeartbeat = function (configuration_id: string, is_running: boolean) {
        onReceiveHeartBeatResponse(node, node_service, stream_service, configuration_id, is_running);
        InterfacesNamespace.emitConfigUpdate();
    };

    if(!node.socket) throw new SocketException(`Cannot create UltraGrid handler until socket has been assigned.`)

    node.socket.on(`${ULTRAGRID_SEND_SERVICE_ID}:initialized`, onUltraGridSendInitialized);
    node.socket.on(`${ULTRAGRID_SEND_SERVICE_ID}:heartbeat`, onUltraGridHeartbeat);

    node.socket.on(`${ULTRAGRID_RECEIVE_SERVICE_ID}:initialized`, onUltraGridReceiveInitialized);
    node.socket.on(`${ULTRAGRID_RECEIVE_SERVICE_ID}:heartbeat`, onUltraGridHeartbeat);

};
