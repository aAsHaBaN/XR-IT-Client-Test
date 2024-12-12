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

// Listener for updates from Nodes regarding service updates, including the initialization, heartbeat and termination of services.
export default (node: Node, node_service: NodesService, stream_service: StreamsService) => {
    const onMVNInitialized = function (configuration_id: string) {
        var configuration = node.configurations.find((c: XRITServicesConfig) => c.id === configuration_id);
        if (!configuration) throw new SocketException(`Internal server error: no configuration with id '${configuration_id}' is registered on node '${node.id}'`)
        configuration.status = "SUCCESS";

        console.log(`\x1b[1m\x1b[32mMVN initialized on ${node.machine_alias}!\x1b[0m\n`);

        const mvn_streams = stream_service.streams.filter((s: Stream) => s.source.configuration_id === configuration_id);
        mvn_streams.forEach(s => {
          stream_service.setStreamAsPending(s.id, "SOURCE", "PENDING");
        })

        const pending_mvn_streams = stream_service.pending_streams.filter((s: Stream) => s.source.configuration_id === configuration!.id);
        if (pending_mvn_streams.length > 0) console.log(`\x1b[34mCreating ${pending_mvn_streams.length} preconfigured MVN stream targets on ${node.machine_alias}...\x1b[0m\n`);

        pending_mvn_streams.forEach(s => {
            const target_node = node_service.getNode(s.target.node_id)
            addMVNStreamTarget(node, target_node!, s);
        });

        InterfacesNamespace.emitConfigUpdate();
    };

    const onMVNHeartBeat = function (configuration_id: string, is_running: boolean) {
        onReceiveHeartBeatResponse(node, node_service, stream_service, configuration_id, is_running);
        InterfacesNamespace.emitConfigUpdate();
    };

    const onMVNTerminated = function (configuration_id: string) {
        var configuration = node.configurations.find(c => c.id === configuration_id);
        if (!configuration) throw new SocketException(`Received terminated message from MVN but it is not registered on ${node.machine_alias}`)

        configuration.status = "OFFLINE";
        stream_service.setConfigurationStreamsAsOffline(configuration_id)

        console.log(`\x1b[31mMVN has terminated on'${node.machine_alias}'\x1b[0m`);
        InterfacesNamespace.emitConfigUpdate();
    }

    const onMVNStreamTargetAdded = function (stream_id: string) {
        const stream = stream_service.onStreamSourceCreated(stream_id);
        console.log(`\x1b[4m\x1b[32mMVN stream target added to ${node.machine_alias}!\x1b[0m`);
        console.log(inspect(stream, false, null, true));
        console.log();
        InterfacesNamespace.emitConfigUpdate();
    }

    const onMVNStreamTargetRemoved = function (stream_id: string) {
        const stream = stream_service.onStreamSourceDeleted(stream_id);
        console.log(`\x1b[4m\x1b[32mMVN stream target removed from ${node.machine_alias}!\x1b[0m`);
        console.log(inspect(stream, false, null, true));
        console.log();
        InterfacesNamespace.emitConfigUpdate();
    }

    const onMVNStreamTargetError = function (stream_id: string) {
        const stream = stream_service.onStreamSourceError(stream_id);
        console.log(`\x1b[4m\x1b[32m$Error on MVN stream target update to ${node.machine_alias}!\x1b[0m`);
        console.log(`${stream}\n`);
        InterfacesNamespace.emitConfigUpdate();
    }

    if(!node.socket) throw new SocketException(`Cannot create MVN handler until socket has been assigned.`)

    node.socket.on(`${MVNServiceID}:initialized`, onMVNInitialized);
    node.socket.on(`${MVNServiceID}:heartbeat`, onMVNHeartBeat);
    node.socket.on(`${MVNServiceID}:terminated`, onMVNTerminated);
    node.socket.on(`${MVNServiceID}:stream-target-added`, onMVNStreamTargetAdded);
    node.socket.on(`${MVNServiceID}:stream-target-removed`, onMVNStreamTargetRemoved);
    node.socket.on(`${MVNServiceID}:stream-target-error`, onMVNStreamTargetError);
};
