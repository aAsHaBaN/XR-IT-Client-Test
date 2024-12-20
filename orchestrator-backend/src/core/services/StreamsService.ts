import { UltraGridSend, UltraGridReceive } from "../../supported-services/models/UltraGrid";
import { addMVNStreamTarget, removeMVNStreamTarget } from "../../supported-services/services/MVNService";
import { addUltraGridSendStreamTarget, addUltraGridReceiveStreamSource, removeUltraGridSendStreamTarget, removeUltraGridReceiveStreamSource } from "../../supported-services/services/UltraGridService";
import { addUnrealEngineStreamSource, removeUnrealEngineStreamSource } from "../../supported-services/services/UnrealEngineService";
import { Node } from "../models/Node";
import { Stream, StreamSource, StreamTarget } from "../models/Stream";
import { SocketException } from "../utils/SocketException";

export class StreamsService {
    public streams: Stream[];
    public pending_streams: Stream[];

    constructor(streams: any[]) {
        this.streams = streams.map(s => { return new Stream(s.source, s.target, s.id, s.settings); });
        this.pending_streams = []
    }

    getStream(stream_id: string) {
        const stream = this.streams.find(s => s.id === stream_id);
        if (!stream) throw new SocketException(`No stream with ${stream_id} exists on this Orchestrator.`)

        return stream;
    }

    getPendingStream(stream_id: string) {
        const stream = this.pending_streams.find(s => s.id === stream_id);
        if (!stream) throw new SocketException(`No pending stream with ${stream_id} exists on this Orchestrator.`)

        return stream;
    }

    getStreamsByNode(node_id: string) {
        return this.streams.filter(s => s.source.node_id === node_id || s.target.node_id === node_id);
    }

    getStreamsByConfiguration(configuration_id: string) {
        return this.streams.filter(s => s.source.node_id === configuration_id || s.target.node_id === configuration_id);
    }

    getPendingStreamsByConfiguration(configuration_id: string) {
        return this.pending_streams.filter(s => s.source.node_id === configuration_id || s.target.node_id === configuration_id);
    }

    getPendingStreamsByNode(node_id: string) {
        return this.pending_streams.filter(s => s.source.node_id === node_id || s.target.node_id === node_id);
    }

    createStream(source_node: Node, target_node: Node, stream_source: StreamSource, stream_target: StreamTarget, stream_settings?: any) {
        if (!source_node.is_online || !target_node.is_online) {
            throw new SocketException(`One or both requested stream endpoints is not online.`);
        }

        const stream = new Stream(stream_source, stream_target, undefined, stream_settings);
        stream.source.status = stream.target.status = "PENDING";
        this.pending_streams.push(stream);

        this.resolveCreateStreamSource(stream, source_node, target_node);
        this.resolveCreateStreamTarget(stream, source_node, target_node);
    }

    removeStream(stream: Stream, source_node: Node, target_node: Node) {
        if (!source_node.is_online || !target_node.is_online)
            throw new SocketException(`Not all nodes for ${stream} are online.`)

        this.setStreamAsPending(stream.id, "BOTH", "PENDING_DELETE");
        this.resolveRemoveStreamSource(stream, source_node, target_node);
        this.resolveRemoveStreamTarget(stream, source_node, target_node);
    }

    onStreamSourceCreated(stream_id: string) {
        const pending_stream = this.getPendingStream(stream_id);

        pending_stream.source.status = "SUCCESS";
        if (pending_stream.target.status != "PENDING" && pending_stream.target.status != "PENDING_DELETE") {
            this.pending_streams = this.pending_streams.filter((c) => c.id != stream_id);
            this.streams.push(pending_stream);
        }

        return pending_stream;
    }

    onStreamSourceDeleted(stream_id: string) {
        const pending_stream = this.getPendingStream(stream_id)
        pending_stream.source.status = "DELETED";

        // If the other stream has successfully returned, we remove the stream from pending state
        // and emit an update to the interfaces
        if (pending_stream.target.status != "PENDING" && pending_stream.target.status != "PENDING_DELETE") {
            this.pending_streams = this.pending_streams.filter((c) => c.id != stream_id);
            this.streams = this.streams.filter((c) => c.id != stream_id);

            // If pending delete, but there was an error, we push this as an update to the Orchestrator
            if (pending_stream.target.status === "ERROR") this.streams.push(pending_stream);
        }

        return pending_stream;
    }

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

    onStreamTargetCreated(stream_id: string) {
        const pending_stream = this.getPendingStream(stream_id)
        pending_stream.target.status = "SUCCESS";

        if (pending_stream.source.status != "PENDING" && pending_stream.source.status != "PENDING_DELETE") {
            this.pending_streams = this.pending_streams.filter((c) => c.id != stream_id);
            this.streams.push(pending_stream);
        }

        return pending_stream;
    }

    onStreamTargetDeleted(stream_id: string) {
        const pending_stream = this.getPendingStream(stream_id)
        pending_stream.target.status = "DELETED";

        // If the other stream has successfully returned, we remove the stream from pending state
        // and emit an update to the interfaces
        if (pending_stream.source.status != "PENDING" && pending_stream.source.status != "PENDING_DELETE") {
            this.pending_streams = this.pending_streams.filter((c) => c.id != stream_id);
            this.streams = this.streams.filter((c) => c.id != stream_id);

            // If pending delete, but there was an error, we push this as an update to the Orchestrator
            if (pending_stream.source.status === "ERROR") this.streams.push(pending_stream);
        }

        return pending_stream;
    }

    onStreamTargetError(stream_id: string) {
        const pending_stream = this.getPendingStream(stream_id)
        pending_stream.target.status = "ERROR";

        if (pending_stream.source.status != "PENDING" && pending_stream.source.status != "PENDING_DELETE") {
            this.pending_streams = this.pending_streams.filter((c) => c.id != stream_id);
            this.streams.push(pending_stream);
        }

        return pending_stream;
    }

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

    setNodeStreamsAsOffline(node_id: string) {
        this.streams.forEach(s => {
            if (s.source.node_id === node_id) {
                s.source.status = "OFFLINE"
            } else if (s.target.node_id === node_id) {
                s.target.status = "OFFLINE"
            }
        })

        this.pending_streams.map(s => {
            if (s.source.node_id === node_id && (s.source.status === "PENDING" || s.source.status === "PENDING_DELETE")) {
                s.source.status = "OFFLINE";
                s.source.error = "Node went offline before stream completed creating."
            } else if (s.target.node_id === node_id && (s.target.status === "PENDING" || s.target.status === "PENDING_DELETE")) {
                s.target.status = "OFFLINE";
                s.target.error = "Node went offline before stream completed created."
            }
        })
    }


    setConfigurationStreamsAsOffline(configuration_id: string) {
        // When service goes offline we need to offline all streams that are registed with this configuration
        this.streams.map(s => {
            if (s.source.configuration_id === configuration_id && s.source.status === "SUCCESS")
                s.source.status = "OFFLINE";
            else if (s.target.configuration_id === configuration_id && s.target.status === "SUCCESS")
                s.target.status = "OFFLINE";
        })

        this.pending_streams.map(s => {
            if (s.source.configuration_id === configuration_id && (s.source.status === "SUCCESS" || s.source.status === "PENDING" || s.source.status === "PENDING_DELETE")) {
                s.source.status = "OFFLINE";
                s.source.error = "Service went offline before stream completed creating."
            } else if (s.target.configuration_id === configuration_id && (s.target.status === "SUCCESS" || s.target.status === "PENDING" || s.target.status === "PENDING_DELETE")) {
                s.target.status = "OFFLINE";
                s.target.error = "Service went offline before stream completed created."
            }
        })
    }

    resolveCreateStreamSource(stream: Stream, source_node: Node, target_node: Node) {
        const source_configuration = StreamsService.getStreamConfiguration(source_node, stream.source);

        switch (source_configuration.software_id) {
            case "MVN":
                addMVNStreamTarget(source_node, target_node, stream);
                break;
            case "OPTITRACK":
                this.onStreamSourceCreated(stream.id);
                break;
            case "ULTRAGRID_SEND":
                addUltraGridSendStreamTarget(source_node, stream, target_node.local_ip, source_configuration.settings as UltraGridSend);
                break;
            default:
                throw new SocketException(`Create is not a valid stream source operation for ${source_configuration.software_id}.`);
        }
    }

    resolveCreateStreamTarget(stream: Stream, source_node: Node, target_node: Node) {
        const target_configuration = StreamsService.getStreamConfiguration(target_node, stream.target);

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

    resolveRemoveStreamSource(stream: Stream, source_node: Node, target_node: Node) {
        const source_configuration = StreamsService.getStreamConfiguration(source_node, stream.source);

        // We need to check if the stream source has already been deleted.
        // This would occur in the case where deletion failed previously and the user is trying again.
        if (stream.source.status != "DELETED") {
            // Resolving service-specific operations for the source node in the stream
            switch (source_configuration.software_id) {
                case "MVN":
                    removeMVNStreamTarget(source_node, target_node, stream);
                    break;
                case "OPTITRACK":
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

    resolveRemoveStreamTarget(stream: Stream, source_node: Node, target_node: Node) {
        const target_configuration = StreamsService.getStreamConfiguration(target_node, stream.target);

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

    static getStreamConfiguration(node: Node, stream_endpoint: StreamSource | StreamTarget) {
        const configuration = node.configurations.find((c) => c.id === stream_endpoint.configuration_id);
        if (!configuration) throw new SocketException(`You cannot edit this stream as ${stream_endpoint.configuration_id} is not registered with node '${node.machine_alias}' `);

        return configuration;
    };

}