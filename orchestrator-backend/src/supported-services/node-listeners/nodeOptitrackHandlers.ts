import { XRITServiceID, XRITServicesConfig } from "../models/XRITServiceConfig";
import { Stream } from "../../core/models/Stream";
import { SocketException } from "../../core/utils/SocketException";
import { Node } from "../../core/models/Node";
import InterfacesNamespace from "../../core/namespaces/InterfacesNamespace";
import { addOptiTrackStreamTarget } from "../services/OptiTrackService";
import { inspect } from "node:util";
import { NodesService } from "../../core/services/NodesService";
import { StreamsService } from "../../core/services/StreamsService";
import { onReceiveHeartBeatResponse } from "../../core/services/HeartbeatService";

const OptitrackServiceID: XRITServiceID = "OPTITRACK"

// Listener for updates from Nodes regarding service updates, including the initialization, heartbeat and termination of services.
export default (node: Node, node_service: NodesService, stream_service: StreamsService) => {
    const onOptitrackInitialized = function (configuration_id: string) {
        var configuration = node.configurations.find((c: XRITServicesConfig) => c.id === configuration_id);
        if (!configuration) throw new SocketException(`Internal server error: no configuration with id '${configuration_id}' is registered on node '${node.id}'`)
        configuration.status = "SUCCESS";

        console.log(`\x1b[1m\x1b[32mOptitrack initialized on ${node.machine_alias}!\x1b[0m`);
        console.log();

        const ot_streams = stream_service.streams.filter((s: Stream) => s.source.configuration_id === configuration_id);
        ot_streams.forEach(s => {
            stream_service.setStreamAsPending(s.id, "SOURCE", "PENDING");
        })

        const pending_ot_streams = stream_service.pending_streams.filter((s: Stream) => s.source.configuration_id === configuration!.id);
        if (pending_ot_streams.length > 0) console.log(`\x1b[34mCreating ${pending_ot_streams.length} preconfigured OptiTrack stream targets on ${node.machine_alias}...\x1b[0m\n`);

        pending_ot_streams.forEach(s => {
            const target_node = node_service.getNode(s.target.node_id)
            addOptiTrackStreamTarget(node, target_node!, s);

        });

        InterfacesNamespace.emitConfigUpdate();
    };

    const onOptitrackHeartBeat = function (configuration_id: string, is_running: boolean) {
        onReceiveHeartBeatResponse(node, node_service, stream_service, configuration_id, is_running);
        InterfacesNamespace.emitConfigUpdate();
    };

    const onOptitrackTerminated = function (configuration_id: string) {
        var configuration = node.configurations.find(c => c.id === configuration_id);
        if (!configuration) throw new SocketException(`Received terminated message from Optitrack but it is not registered on ${node.machine_alias}`)

        configuration.status = "OFFLINE";
        stream_service.setConfigurationStreamsAsOffline(configuration_id)

        console.log(`\x1b[31mOptitrack has terminated on'${node.machine_alias}'\x1b[0m`);
        InterfacesNamespace.emitConfigUpdate();
    }

    const onOptitrackStreamTargetAdded = function (stream_id: string) {
        const stream = stream_service.onStreamSourceCreated(stream_id);
        console.log(`\x1b[4m\x1b[32mOptiTrack stream target added to ${node.machine_alias}!\x1b[0m`);
        console.log(inspect(stream, false, null, true));
        console.log();
        InterfacesNamespace.emitConfigUpdate();
    }

    const onOptitrackStreamTargetRemoved = function (stream_id: string) {
        const stream = stream_service.onStreamSourceDeleted(stream_id);
        console.log(`\x1b[4m\x1b[32mOptiTrack stream target removed from ${node.machine_alias}!\x1b[0m`);
        console.log(inspect(stream, false, null, true));
        console.log();
        InterfacesNamespace.emitConfigUpdate();
    }

    const onOptitrackStreamTargetError = function (stream_id: string) {
        const stream = stream_service.onStreamSourceError(stream_id);
        console.log(`\x1b[4m\x1b[32m$Error on OptiTrack stream target update to ${node.machine_alias}!\x1b[0m`);
        console.log(`${stream}\n`);
        InterfacesNamespace.emitConfigUpdate();
    }

    if (!node.socket) throw new SocketException(`Cannot create OptiTrack handler until socket has been assigned.`)

    node.socket.on(`${OptitrackServiceID}:initialized`, onOptitrackInitialized);
    node.socket.on(`${OptitrackServiceID}:heartbeat`, onOptitrackHeartBeat);
    node.socket.on(`${OptitrackServiceID}:terminated`, onOptitrackTerminated);
    node.socket.on(`${OptitrackServiceID}:stream-target-added`, onOptitrackStreamTargetAdded);
    node.socket.on(`${OptitrackServiceID}:stream-target-removed`, onOptitrackStreamTargetRemoved);
    node.socket.on(`${OptitrackServiceID}:stream-target-error`, onOptitrackStreamTargetError);
};
