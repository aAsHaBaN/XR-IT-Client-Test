import { UltraGridSend, UltraGridReceive } from "../../supported-services/models/UltraGrid";
import { addMVNStreamTarget, removeMVNStreamTarget } from "../../supported-services/services/MVNService";
import { addUltraGridSendStreamTarget, addUltraGridReceiveStreamSource, removeUltraGridSendStreamTarget, removeUltraGridReceiveStreamSource } from "../../supported-services/services/UltraGridService";
import { addUnrealEngineStreamSource, removeUnrealEngineStreamSource } from "../../supported-services/services/UnrealEngineService";
import { Node } from "../models/Node";
import { Stream, StreamSource, StreamTarget } from "../models/Stream";
import { SocketException } from "../utils/SocketException";

// Service which maintains and manages the state of an Orchestrator's Streams.
// In this state we manage active streams and those pending updates. For streams pending
// updates we are awaiting software level updates on the machines which the stream endpoint
// corresponds to.
export class StreamsService {
    public streams: Stream[];
    public pending_streams: Stream[];

    constructor(streams: any[]) {
        this.streams = streams.map(s => { return new Stream(s.source, s.target, s.id, s.settings); });
        this.pending_streams = []
    }

    // Returns a complete stream with matching id registered with the current stream
    getStream(stream_id: string): Stream {
        const stream = this.streams.find(s => s.id === stream_id);
        if (!stream) throw new SocketException(`No stream with ${stream_id} exists on this Orchestrator.`)

        return stream;
    }

    // Returns an array of completed streams whose source or target endpoint is associated with a Node
    getStreamsByNode(node_id: string): Stream[] {
        return this.streams.filter(s => s.source.node_id === node_id || s.target.node_id === node_id);
    }

    // Returns an array of completed stream whose source or target endpoint is associated with a configuration
    getStreamsByConfiguration(configuration_id: string): Stream[] {
        return this.streams.filter(s => s.source.node_id === configuration_id || s.target.node_id === configuration_id);
    }

    // Returns a pending stream with matching id registered with the current stream
    getPendingStream(stream_id: string): Stream {
        const stream = this.pending_streams.find(s => s.id === stream_id);
        if (!stream) throw new SocketException(`No pending stream with ${stream_id} exists on this Orchestrator.`)

        return stream;
    }

    // Returns an array of pending streams whose source or target endpoint is associated with a Node
    getPendingStreamsByNode(node_id: string): Stream[] {
        return this.pending_streams.filter(s => s.source.node_id === node_id || s.target.node_id === node_id);
    }

    // Returns an array of pending stream whose source or target endpoint is associated with a configuration
    getPendingStreamsByConfiguration(configuration_id: string): Stream[] {
        return this.pending_streams.filter(s => s.source.node_id === configuration_id || s.target.node_id === configuration_id);
    }

    // Creates a stream between the corresponding machines and softwares in the XR-IT network.
    // Here, a request is sent to the machines to create a stream.
    createStream(source_node: Node, target_node: Node, stream_source: StreamSource, stream_target: StreamTarget, stream_settings?: any) {
        if (!source_node.is_online || !target_node.is_online) {
            throw new SocketException(`One or both requested stream endpoints is not online.`);
        }

        const stream = new Stream(stream_source, stream_target, undefined, stream_settings);
        stream.source.status = stream.target.status = "PENDING";
        this.pending_streams.push(stream);

        this.createStreamSource(stream, source_node, target_node);
        this.createStreamTarget(stream, source_node, target_node);
    }

    // Resolves the operation to execute when creating a stream source for a specific software
    createStreamSource(stream: Stream, source_node: Node, target_node: Node) {
        const source_configuration = this.getStreamConfiguration(source_node, stream.source);

        switch (source_configuration.software_id) {
            case "MVN":
                addMVNStreamTarget(source_node, target_node, stream);
                break;
            case "OPTITRACK":
                // OptiTrack is always streaming, therefore no operation is needed
                // other than marking the stream source as created.
                this.onStreamSourceCreated(stream.id);
                break;
            case "ULTRAGRID_SEND":
                addUltraGridSendStreamTarget(source_node, stream, target_node.local_ip, source_configuration.settings as UltraGridSend);
                break;
            default:
                throw new SocketException(`Create is not a valid stream source operation for ${source_configuration.software_id}.`);
        }
    }

    // Resolves the operation to execute when creating a stream target for a specific software
    createStreamTarget(stream: Stream, source_node: Node, target_node: Node) {
        const target_configuration = this.getStreamConfiguration(target_node, stream.target);

        // Resolving service-specific operations for the target node in the stream
        switch (target_configuration.software_id) {
            case "UNREAL_ENGINE":
                addUnrealEngineStreamSource(source_node, target_node!, stream);
                break;
            case "ULTRAGRID_RECEIVE":
                addUltraGridReceiveStreamSource(target_node, stream, source_node.local_ip, target_configuration.settings as UltraGridReceive);
                break;
            default:
                throw new SocketException(`Create is not a valid stream target operation for ${target_configuration.software_id}.`);
        }
    }

    // Resolves the operation to execute when creating a stream target for a specific software
    removeStream(stream: Stream, source_node: Node, target_node: Node) {
        if (!source_node.is_online || !target_node.is_online)
            throw new SocketException(`Not all nodes for ${stream} are online.`)

        this.setStreamAsPending(stream.id, "BOTH", "PENDING_DELETE");
        this.removeStreamSource(stream, source_node, target_node);
        this.removeStreamTarget(stream, source_node, target_node);
    }

    removeStreamSource(stream: Stream, source_node: Node, target_node: Node) {
        const source_configuration = this.getStreamConfiguration(source_node, stream.source);

        // We need to check if the stream source has already been deleted.
        // This would occur in the case where deletion failed previously and the user is trying again.
        if (stream.source.status != "DELETED") {
            // Resolving service-specific operations for the source node in the stream
            switch (source_configuration.software_id) {
                case "MVN":
                    removeMVNStreamTarget(source_node, target_node, stream);
                    break;
                case "OPTITRACK":
                    // In XR-IT OptiTrack software is always set to stream, instead we only
                    // toggle the receiving service. Therefore, no operation is needed and stream
                    // source can be marked as deleted.
                    this.onStreamSourceDeleted(stream.id);
                    break;
                case "ULTRAGRID_SEND":
                    removeUltraGridSendStreamTarget(source_node, stream, target_node.local_ip);
                    break;
                default:
                    throw new SocketException(`Delete is not a valid stream source operation for ${source_configuration.software_id}.`);
            }
        }
    }

    // Resolves the operation to execute when removing a stream target from a specific software
    removeStreamTarget(stream: Stream, source_node: Node, target_node: Node) {
        const target_configuration = this.getStreamConfiguration(target_node, stream.target);

        // As above, we need to check if the stream target has already been deleted.
        if (stream.target.status != "DELETED") {
            // Resolving service-specific operations for the target node in the stream
            switch (target_configuration.software_id) {
                case "UNREAL_ENGINE":
                    removeUnrealEngineStreamSource(target_node, stream);
                    break;
                case "ULTRAGRID_RECEIVE":
                    removeUltraGridReceiveStreamSource(target_node, stream, source_node.local_ip);
                    break;
                default:
                    throw new SocketException(`Delete is not a valid stream target operation for ${target_configuration.software_id}.`);
            }
        }
    }

    // Marks a stream source as created. If the other node endpoint (the target) has finished its creation operation
    // the stream is removed from pending state and moved to the completed streams list.
    onStreamSourceCreated(stream_id: string) {
        const pending_stream = this.getPendingStream(stream_id);

        pending_stream.source.status = "SUCCESS";

        if (pending_stream.target.status != "PENDING" && pending_stream.target.status != "PENDING_DELETE") {
            this.pending_streams = this.pending_streams.filter((c) => c.id != stream_id);
            this.streams.push(pending_stream);
        }

        return pending_stream;
    }

    // Marks a stream source as deleted. If the other node endpoint (the target) has finished its creation operation
    // the stream is removed from the state, unless there was an error during the stream operation
    onStreamSourceDeleted(stream_id: string) {
        const pending_stream = this.getPendingStream(stream_id)
        pending_stream.source.status = "DELETED";

        if (pending_stream.target.status != "PENDING" && pending_stream.target.status != "PENDING_DELETE") {
            this.pending_streams = this.pending_streams.filter((c) => c.id != stream_id);
            this.streams = this.streams.filter((c) => c.id != stream_id);

            if (pending_stream.target.status === "ERROR") this.streams.push(pending_stream);
        }

        return pending_stream;
    }

    // Marks a stream source as having had an error during an operation. If the other node endpoint (the target) has 
    // finished its creation operation from the pending state.
    onStreamSourceError(stream_id: string, error_message?: string) {
        const pending_stream = this.getPendingStream(stream_id)
        pending_stream.source.status = "ERROR";
        pending_stream.source.error = error_message

        if (pending_stream.target.status != "PENDING" && pending_stream.target.status != "PENDING_DELETE") {
            this.pending_streams = this.pending_streams.filter((c) => c.id != stream_id);
            this.streams.push(pending_stream);
        }

        return pending_stream;
    }

    // Marks a stream target as created. If the other node endpoint (the source) has finished its creation operation
    // the stream is removed from pending state and moved to the completed streams list.
    onStreamTargetCreated(stream_id: string) {
        const pending_stream = this.getPendingStream(stream_id)
        pending_stream.target.status = "SUCCESS";

        if (pending_stream.source.status != "PENDING" && pending_stream.source.status != "PENDING_DELETE") {
            this.pending_streams = this.pending_streams.filter((c) => c.id != stream_id);
            this.streams.push(pending_stream);
        }

        return pending_stream;
    }

    // Marks a stream target as deleted. If the other node endpoint (the source) has finished its creation operation
    // the stream is removed from the state, unless there was an error during the stream operation
    onStreamTargetDeleted(stream_id: string) {
        const pending_stream = this.getPendingStream(stream_id)
        pending_stream.target.status = "DELETED";

        if (pending_stream.source.status != "PENDING" && pending_stream.source.status != "PENDING_DELETE") {
            this.pending_streams = this.pending_streams.filter((c) => c.id != stream_id);
            this.streams = this.streams.filter((c) => c.id != stream_id);

            // If pending delete, but there was an error, we push this as an update to the Orchestrator
            if (pending_stream.source.status === "ERROR") this.streams.push(pending_stream);
        }

        return pending_stream;
    }

    // Marks a stream target as having had an error during an operation. If the other node endpoint (the source) has 
    // finished its creation operation from the pending state.
    onStreamTargetError(stream_id: string) {
        const pending_stream = this.getPendingStream(stream_id)
        pending_stream.target.status = "ERROR";

        if (pending_stream.source.status != "PENDING" && pending_stream.source.status != "PENDING_DELETE") {
            this.pending_streams = this.pending_streams.filter((c) => c.id != stream_id);
            this.streams.push(pending_stream);
        }

        return pending_stream;
    }

    // Sets a stream source, target or both as PENDING or PENDING_DELETE depending on parameters provided. The stream
    // is then moved to the pending streams list in the state.
    setStreamAsPending(id: string, endpoint_to_set: "SOURCE" | "TARGET" | "BOTH", update_type: "PENDING" | "PENDING_DELETE") {
        const i = this.streams.findIndex(s => s.id === id)
        if (i === -1) {
            throw new SocketException(`Stream ${id} does not belong on this orchestrator.`);
        }

        const stream = this.streams.splice(i, 1)[0]!

        if (endpoint_to_set === "SOURCE" || endpoint_to_set === "BOTH") {
            stream.source.status = update_type;
        }

        if (endpoint_to_set === "TARGET" || endpoint_to_set === "BOTH") {
            stream.target.status = update_type;
        }

        this.pending_streams.push(stream);
    }

    // Sets all streams associated with a Node as offline due to the itself going offline
    setNodeStreamsAsOffline(node_id: string) {
        this.streams.forEach(s => {
            if (s.source.node_id === node_id) {
                s.source.status = "OFFLINE"
            } else if (s.target.node_id === node_id) {
                s.target.status = "OFFLINE"
            }
        })

        // Case where a pending stream has not completed. An error must be added, noting that the Node went offline before
        // stream creation could complete
        this.pending_streams.map(s => {
            if (s.source.node_id === node_id && (s.source.status === "PENDING" || s.source.status === "PENDING_DELETE") ||
                (s.target.node_id === node_id && (s.target.status === "PENDING" || s.target.status === "PENDING_DELETE"))) {
                var stream_endpoint = s.source.node_id === node_id ? s.source : s.target
                stream_endpoint.status = "OFFLINE"
                stream_endpoint.error = "Node went offline before stream completed creating."
            }
        })
    }

    // Sets all streams associated with a configuration as pending
    setConfigurationStreamsAsPending(node_id: string, configuration_id: string) {
        for (var i = 0; i < this.streams.length; i++) {
            if ((this.streams[i]!.source.node_id === node_id && this.streams[i]!.source.configuration_id === configuration_id) ||
                (this.streams[i]!.target.node_id === node_id && this.streams[i]!.target.configuration_id === configuration_id)) {
                if (this.streams[i]!.source.node_id === node_id) {
                    this.streams[i]!.source.status = "PENDING"
                } else {
                    this.streams[i]!.target.status = "PENDING"
                }

                this.pending_streams.push(this.streams[i]!);
                this.streams.splice(i, 1);
                i--;
            }
        }
    }

    // Sets all streams associated with a configuration as offline
    setConfigurationStreamsAsOffline(configuration_id: string) {
        // When service goes offline we need to offline all streams that are registed with this configuration
        this.streams.map(s => {
            if (s.source.configuration_id === configuration_id && s.source.status === "SUCCESS")
                s.source.status = "OFFLINE";
            else if (s.target.configuration_id === configuration_id && s.target.status === "SUCCESS")
                s.target.status = "OFFLINE";
        })

        // Case where a pending stream has not completed. An error must be added, noting that the service went offline before
        // stream creation could complete
        this.pending_streams.map(s => {
            if (s.source.node_id === configuration_id && (s.source.status === "PENDING" || s.source.status === "PENDING_DELETE") ||
                (s.target.node_id === configuration_id && (s.target.status === "PENDING" || s.target.status === "PENDING_DELETE"))) {
                var stream_endpoint = s.source.node_id === configuration_id ? s.source : s.target
                stream_endpoint.status = "OFFLINE"
                stream_endpoint.error = "Service went offline before stream completed creating."
            }
        })
    }

    // Returns and validates a service configuration associated with a stream endpoint
    private getStreamConfiguration(node: Node, stream_endpoint: StreamSource | StreamTarget) {
        const configuration = node.configurations.find((c) => c.id === stream_endpoint.configuration_id);
        if (!configuration) throw new SocketException(`You cannot edit this stream as ${stream_endpoint.configuration_id} is not registered with node '${node.machine_alias}' `);

        return configuration;
    };
}