import { XRITServiceID, XRITServicesConfig } from "../models/XRITServiceConfig";
import { addMVNStreamTarget } from "../services/MVNService";
import { Stream } from "../../core/models/Stream";
import { SocketException } from "../../core/utils/SocketException";
import { Node } from "../../core/models/Node";
import InterfacesNamespace from "../../core/namespaces/InterfacesNamespace";
import { inspect } from "node:util";
import { NodesService } from "../../core/services/NodesService";
import { onReceiveHeartBeatResponse } from "../../core/services/HeartbeatService";
import { StreamsService } from "../../core/services/StreamsService";

const MVNServiceID: XRITServiceID = "MVN"

/*
  Listeners which handles requests and updates regarding MVN software service updates, 
  including its initialization, heartbeat and stream management. These requests should 
  be made from an XR-IT Node connected to the Nodes Namespace.
  
  See more on this in: src > core > namespaces > NodesNamespace.ts
*/
export default (node: Node, node_service: NodesService, stream_service: StreamsService) => {

    /*
        Listener for a message indicating that an MVN instance with matching id has been launched 
        on a machine. It then attempts to create all streams registered in the current XR-IT state 
        associated with this MVN instance.
    */
    const onMVNInitialized = function (configuration_id: string) {
        // Find configuration associated with this instance and mark it as successful
        var configuration = node.configurations.find((c: XRITServicesConfig) => c.id === configuration_id);
        if (!configuration) throw new SocketException(`Internal server error: no configuration with id '${configuration_id}' is registered on node '${node.id}'`)
        configuration.status = "SUCCESS";

        console.log(`\x1b[1m\x1b[32mMVN initialized on ${node.machine_alias}!\x1b[0m\n`);

        // Mark all completed streams as pending as they need to be recreated everytime MVN launches
        const mvn_streams = stream_service.streams.filter((s: Stream) => s.source.configuration_id === configuration_id);
        mvn_streams.forEach(s => {
            stream_service.setStreamAsPending(s.id, "SOURCE", "PENDING");
        })

        // For each pending stream execute service level operation associated with creating an MVN stream
        // NOTE: We do not use the above list 'mvn_streams' as there may have been streams left in the pending_state
        // which we need to re-create, given the case of MVN relaunching after a crash.
        const pending_mvn_streams = stream_service.pending_streams.filter((s: Stream) => s.source.configuration_id === configuration!.id);
        if (pending_mvn_streams.length > 0) console.log(`\x1b[34mCreating ${pending_mvn_streams.length} preconfigured MVN stream targets on ${node.machine_alias}...\x1b[0m\n`);

        pending_mvn_streams.forEach(s => {
            const target_node = node_service.getNode(s.target.node_id)
            addMVNStreamTarget(node, target_node!, s);
        });

        InterfacesNamespace.emitConfigUpdate();
    };

    // Listener for a response to a heartbeat ping which is periodically sent to this Node to ensure
    // whether an MVN instance with matching id is running matches what is currently registered in the 
    // Orchestrator's state.
    const onMVNHeartBeat = function (configuration_id: string, is_running: boolean) {
        onReceiveHeartBeatResponse(node, node_service, stream_service, configuration_id, is_running);
        InterfacesNamespace.emitConfigUpdate();
    };

    // Listener for message indicating MVN has successfully created a stream.
    const onMVNStreamTargetAdded = function (stream_id: string) {
        const stream = stream_service.onStreamSourceCreated(stream_id);
        console.log(`\x1b[4m\x1b[32mMVN stream target added to ${node.machine_alias}!\x1b[0m`);
        console.log(inspect(stream, false, null, true));
        console.log();
        InterfacesNamespace.emitConfigUpdate();
    }

    // Listener for message indicating MVN has successfully removed a stream.
    const onMVNStreamTargetRemoved = function (stream_id: string) {
        const stream = stream_service.onStreamSourceDeleted(stream_id);
        console.log(`\x1b[4m\x1b[32mMVN stream target removed from ${node.machine_alias}!\x1b[0m`);
        console.log(inspect(stream, false, null, true));
        console.log();
        InterfacesNamespace.emitConfigUpdate();
    }

    // Listener for message indicating an error occured during an MVN stream update operation.
    const onMVNStreamTargetError = function (stream_id: string) {
        const stream = stream_service.onStreamSourceError(stream_id);
        console.log(`\x1b[4m\x1b[32m$Error on MVN stream target update to ${node.machine_alias}!\x1b[0m`);
        console.log(`${stream}\n`);
        InterfacesNamespace.emitConfigUpdate();
    }

    if (!node.socket) throw new SocketException(`Cannot create MVN handler until socket has been assigned.`)

    node.socket.on(`${MVNServiceID}:initialized`, onMVNInitialized);
    node.socket.on(`${MVNServiceID}:heartbeat`, onMVNHeartBeat);
    node.socket.on(`${MVNServiceID}:stream-target-added`, onMVNStreamTargetAdded);
    node.socket.on(`${MVNServiceID}:stream-target-removed`, onMVNStreamTargetRemoved);
    node.socket.on(`${MVNServiceID}:stream-target-error`, onMVNStreamTargetError);
};
