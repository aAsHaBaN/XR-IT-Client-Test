import { XRITServiceID, XRITServicesConfig } from "../models/XRITServiceConfig";
import { SocketException } from "../../core/utils/SocketException";
import { Node } from "../../core/models/Node";
import InterfacesNamespace from "../../core/namespaces/InterfacesNamespace";
import { NodesService } from "../../core/services/NodesService";
import { StreamsService } from "../../core/services/StreamsService";
import { onReceiveHeartBeatResponse } from "../../core/services/HeartbeatService";
import { Stream } from "../../core/models/Stream";

const ULTRAGRID_SEND_SERVICE_ID: XRITServiceID = "ULTRAGRID_SEND"
const ULTRAGRID_RECEIVE_SERVICE_ID: XRITServiceID = "ULTRAGRID_RECEIVE"

/*
  Listeners which handles requests and updates regarding UltraGrid software service updates, 
  including its initialization, heartbeat, and stream management. These requests should be 
  made from an XR-IT Node connected to the Nodes Namespace.
  
  See more on this in: src > core > namespaces > NodesNamespace.ts
*/
export default (node: Node, node_service: NodesService, stream_service: StreamsService) => {
    /*
        Listener for a message indicating than an UltraGrid Send or Receive instance with the provided 
        configuration_id has been launched on a machine. It then requests the machine create 
        all UltraGrid streams associated with this configuration.

        Note: we have two different listeners for Send / Receive and we resolve this using the type
        parameter in the socket listeners below.
    */
    const onUltraGridInitialized = function (configuration_id: string, type: "ULTRAGRID_SEND" | "ULTRAGRID_RECEIVE") {
        // Find configuration associated with this instance and mark it as successful
        var configuration = node.configurations.find((c: XRITServicesConfig) => c.id === configuration_id);
        if (!configuration) throw new SocketException(`Internal server error: no configuration with id '${configuration_id}' is registered on node '${node.id}'`)
        configuration.status = "SUCCESS";

        console.log(`\x1b[1m\x1b[32mUltraGrid ${type === "ULTRAGRID_SEND" ? "Send" : "Receive"} initialized on ${node.machine_alias}!\x1b[0m\n`);

        // Mark all completed streams as pending as they need to be recreated everytime this UltraGrid instance launches
        const ug_streams = stream_service.streams.filter((s: Stream) => s.source.configuration_id === configuration_id);
        ug_streams.forEach(s => {
            stream_service.setStreamAsPending(s.id, type === "ULTRAGRID_SEND" ? "SOURCE" : "TARGET", "PENDING");
        })

        // For each pending stream execute service level operation associated with creating an UltraGrid Send stream
        // NOTE: We do not use the above list 'mvn_streams' as there may have been streams left in the pending_state
        // which we need to re-create, given the case of UltraGrid relaunching after a crash.
        const pending_ug_streams = stream_service.pending_streams.filter((s: Stream) => s.source.configuration_id === configuration!.id);
        if (pending_ug_streams.length > 0) console.log(`\x1b[34mCreating ${pending_ug_streams.length} preconfigured UltraGrid ${type === "ULTRAGRID_SEND" ? "Send" : "Receive"} streams on ${node.machine_alias}...\x1b[0m\n`);

        pending_ug_streams.forEach(s => {
            const other_node = type === "ULTRAGRID_SEND" ? node_service.getNode(s.target.node_id) : node_service.getNode(s.source.node_id);
            type === "ULTRAGRID_SEND" ? stream_service.createStreamSource(s, node, other_node) : stream_service.createStreamTarget(s, other_node, node);
        });


        InterfacesNamespace.emitConfigUpdate();
    };


    // Listener for a response to a heartbeat ping which is periodically sent to this Node to ensure
    // whether an UltraGrid instance with matching id is running matches what is currently registered in the 
    // Orchestrator's state.
    const onUltraGridHeartbeat = function (configuration_id: string, is_running: boolean) {
        onReceiveHeartBeatResponse(node, node_service, stream_service, configuration_id, is_running);
        InterfacesNamespace.emitConfigUpdate();
    };

    if (!node.socket) throw new SocketException(`Cannot create UltraGrid handler until socket has been assigned.`)

    // Resolve initialize function to execute UltraGrid Send logic
    node.socket.on(`${ULTRAGRID_SEND_SERVICE_ID}:initialized`, (configuration_id: string) => onUltraGridInitialized(configuration_id, "ULTRAGRID_SEND"));
    node.socket.on(`${ULTRAGRID_SEND_SERVICE_ID}:heartbeat`, onUltraGridHeartbeat);

    // Resolve initialize function to execute UltraGrid Receive logic
    node.socket.on(`${ULTRAGRID_RECEIVE_SERVICE_ID}:initialized`, (configuration_id: string) => onUltraGridInitialized(configuration_id, "ULTRAGRID_RECEIVE"));
    node.socket.on(`${ULTRAGRID_RECEIVE_SERVICE_ID}:heartbeat`, onUltraGridHeartbeat);

};
