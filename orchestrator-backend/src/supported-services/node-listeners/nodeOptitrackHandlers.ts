import { XRITServiceID, XRITServicesConfig } from "../models/XRITServiceConfig";
import { SocketException } from "../../core/utils/SocketException";
import { Node } from "../../core/models/Node";
import InterfacesNamespace from "../../core/namespaces/InterfacesNamespace";
import { NodesService } from "../../core/services/NodesService";
import { StreamsService } from "../../core/services/StreamsService";
import { onReceiveHeartBeatResponse } from "../../core/services/HeartbeatService";

const OptitrackServiceID: XRITServiceID = "OPTITRACK"

/*
  Listeners which handles requests and updates regarding OptiTrack software service updates, 
  including its initialization, heartbeat, and stream management. These requests should be 
  made from an XR-IT Node connected to the Nodes Namespace.
  
  See more on this in: src > core > namespaces > NodesNamespace.ts
*/
export default (node: Node, node_service: NodesService, stream_service: StreamsService) => {

    /*
        Listener for a message indicating that OptiTrack with the provided configuration_id 
        has been launched on a machine. Given that OptiTrack is always streaming in XR-IT 
        all streams are marked as successful.
    */
    const onOptitrackInitialized = function (configuration_id: string) {
        var configuration = node.configurations.find((c: XRITServicesConfig) => c.id === configuration_id);
        if (!configuration) throw new SocketException(`Internal server error: no configuration with id '${configuration_id}' is registered on node '${node.id}'`)
        configuration.status = "SUCCESS";

        console.log(`\x1b[1m\x1b[32mOptitrack initialized on ${node.machine_alias}!\x1b[0m`);
        console.log(`\x1b[1m\x1b[33mNote: in XR-IT streaming is always enabled in OptiTrack software.\x1b[0m`);
        console.log();

        // Mark OptiTrack stream sources as successful
        stream_service.streams = stream_service.streams.map(s => {
            if (s.source.configuration_id === configuration_id) {
                s.source.status = "SUCCESS"
            }

            return s;
        })

        // Clean up of pending OptiTrack streams
        stream_service.pending_streams.forEach(s => {
            if (s.source.configuration_id === configuration_id && s.source.status === "PENDING") {
                stream_service.onStreamSourceCreated(s.id)
            } else {
                stream_service.onStreamSourceDeleted(s.id);
            }
        });

        InterfacesNamespace.emitConfigUpdate();
    };

    // Listener for a response to a heartbeat ping which is periodically sent to this Node to ensure
    // whether OptiTrack is running matches what is currently marked in the Orchestrator's state.
    const onOptitrackHeartBeat = function (configuration_id: string, is_running: boolean) {
        onReceiveHeartBeatResponse(node, node_service, stream_service, configuration_id, is_running);
        InterfacesNamespace.emitConfigUpdate();
    };

    if (!node.socket) throw new SocketException(`Cannot create OptiTrack handler until socket has been assigned.`)

    node.socket.on(`${OptitrackServiceID}:initialized`, onOptitrackInitialized);
    node.socket.on(`${OptitrackServiceID}:heartbeat`, onOptitrackHeartBeat);
};
