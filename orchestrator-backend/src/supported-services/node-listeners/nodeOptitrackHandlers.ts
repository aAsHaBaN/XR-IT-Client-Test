import { XRITServiceID, XRITServicesConfig } from "../models/XRITServiceConfig";
import { SocketException } from "../../core/utils/SocketException";
import { Node } from "../../core/models/Node";
import InterfacesNamespace from "../../core/namespaces/InterfacesNamespace";
import { NodesService } from "../../core/services/NodesService";
import { StreamsService } from "../../core/services/StreamsService";
import { onReceiveHeartBeatResponse } from "../../core/services/HeartbeatService";
import { OptiTrackSettings } from "../models/OptiTrack";

const OptitrackServiceID: XRITServiceID = "OPTITRACK"

// Listener for updates from Nodes regarding service updates, including the initialization, heartbeat and termination of services.
export default (node: Node, node_service: NodesService, stream_service: StreamsService) => {
    const onOptitrackInitialized = function (configuration_id: string) {
        var configuration = node.configurations.find((c: XRITServicesConfig) => c.id === configuration_id);
        if (!configuration) throw new SocketException(`Internal server error: no configuration with id '${configuration_id}' is registered on node '${node.id}'`)
        configuration.status = "SUCCESS";

        console.log(`\x1b[1m\x1b[32mOptitrack initialized on ${node.machine_alias}!\x1b[0m`);
        console.log(`\x1b[1m\x1b[32mPer OptiTrack settings, all streams are ${configuration.settings.is_streaming_enabled ? "enabled" : "disabled"}\x1b[0m`);
        console.log();

        stream_service.streams = stream_service.streams.map(s => {
            if (s.source.configuration_id === configuration_id) {
                s.source.status = "SUCCESS"
            }

            return s;
        })

        stream_service.pending_streams.forEach(s => {
            if (s.source.configuration_id === configuration_id && s.source.status === "PENDING") {
                stream_service.onStreamSourceCreated(s.id)
            } else {
                stream_service.onStreamSourceDeleted(s.id);
            }
        });

        InterfacesNamespace.emitConfigUpdate();
    };

    const onOptitrackHeartBeat = function (configuration_id: string, is_running: boolean) {
        const relevant_streams = stream_service.getPendingStreamsByConfiguration(configuration_id);
        
        // If we have pending streams, we may be turning the service on and off, therefore
        // this update is not relevant.
        if (relevant_streams.length === 0) {
            onReceiveHeartBeatResponse(node, node_service, stream_service, configuration_id, is_running);
            InterfacesNamespace.emitConfigUpdate();
        }
    };

    const onOptitrackTerminated = function (configuration_id: string) {
        var configuration = node.configurations.find(c => c.id === configuration_id);
        if (!configuration) throw new SocketException(`Received terminated message from Optitrack but it is not registered on ${node.machine_alias}`)

        configuration.status = "OFFLINE";
        stream_service.setConfigurationStreamsAsOffline(configuration_id)

        console.log(`\x1b[31mOptitrack has terminated on'${node.machine_alias}'\x1b[0m`);
        InterfacesNamespace.emitConfigUpdate();
    }

    const onOptitrackStreamingEnabled = function (configuration_id: string) {
        const configuration = node.getConfiguration(configuration_id);
        configuration.settings.is_streaming_enabled = true;

        const optitrack_streams = stream_service.getStreamsByConfiguration(configuration_id);
        const pending_optitrack_streams = stream_service.getPendingStreamsByConfiguration(configuration_id)

        optitrack_streams.forEach(ot => ot.source.status = "SUCCESS");
        pending_optitrack_streams.forEach(ot => stream_service.onStreamSourceCreated(ot.id))

        console.log(`\x1b[32mAll OptiTrack streams on ${node.machine_alias} enabled!\x1b[0m\n`);
        InterfacesNamespace.emitConfigUpdate();
    }

    const onOptitrackStreamingDisabled = function (configuration_id: string) {
        const configuration = node.getConfiguration(configuration_id);
        configuration.settings.is_streaming_enabled = false;

        const optitrack_streams = stream_service.getStreamsByConfiguration(configuration_id);
        const pending_optitrack_streams = stream_service.getPendingStreamsByConfiguration(configuration_id)

        optitrack_streams.forEach(ot => {
            ot.source.status = "OFFLINE";
            ot.source.error = "OptiTrack streams have been disabled"
        });
        pending_optitrack_streams.forEach(ot => stream_service.onStreamSourceDeleted(ot.id))

        console.log(`\x1b[32mAll OptiTrack streams on ${node.machine_alias} disabled!\x1b[0m\n`);
        InterfacesNamespace.emitConfigUpdate();
    }

    const onOptitrackStreamingError = function (configuration_id: string, error_message: string) {
        const configuration = node.getConfiguration(configuration_id);
        configuration.settings.is_streaming_enabled = false;

        const optitrack_streams = stream_service.getStreamsByConfiguration(configuration_id);
        const pending_optitrack_streams = stream_service.getPendingStreamsByConfiguration(configuration_id)

        optitrack_streams.forEach(ot => {
            ot.source.status = "ERROR";
            ot.source.error = error_message
        });
        pending_optitrack_streams.forEach(ot => stream_service.onStreamSourceError(ot.id, error_message))

        console.log(`\x1b[32mError while updating Optitrack streams on ${node.machine_alias}!\x1b[0m\n`);
        InterfacesNamespace.emitConfigUpdate();
    }

    if (!node.socket) throw new SocketException(`Cannot create OptiTrack handler until socket has been assigned.`)

    node.socket.on(`${OptitrackServiceID}:initialized`, onOptitrackInitialized);
    node.socket.on(`${OptitrackServiceID}:heartbeat`, onOptitrackHeartBeat);
    node.socket.on(`${OptitrackServiceID}:terminated`, onOptitrackTerminated);
    node.socket.on(`${OptitrackServiceID}:streaming-enabled`, onOptitrackStreamingEnabled);
    node.socket.on(`${OptitrackServiceID}:streaming-disabled`, onOptitrackStreamingDisabled);
    node.socket.on(`${OptitrackServiceID}:streaming-error`, onOptitrackStreamingError);
};
