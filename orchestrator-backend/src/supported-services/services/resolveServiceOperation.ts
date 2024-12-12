import { Node } from "../../core/models/Node";
import { Stream, StreamSource, StreamTarget } from "../../core/models/Stream";
import { SocketException } from "../../core/utils/SocketException";
import { UltraGridReceive, UltraGridSend } from "../models/UltraGrid";
import { addMVNStreamTarget, removeMVNStreamTarget } from "./MVNService";
import { addOptiTrackStreamTarget, removeOptiTrackStreamTarget } from "./OptiTrackService";
import { addUltraGridReceiveStreamSource, addUltraGridSendStreamTarget, removeUltraGridReceiveStreamSource, removeUltraGridSendStreamTarget } from "./UltraGridService";
import { addUnrealEngineStreamSource, removeUnrealEngineStreamSource } from "./UnrealEngineService";

export function resolveCreateStreamSource(stream: Stream, source_node: Node, target_node: Node) {
    const source_configuration = getStreamConfiguration(source_node, stream.source);

    switch (source_configuration.software_id) {
        case "MVN":
            addMVNStreamTarget(source_node, target_node, stream);
            break;
        case "OPTITRACK":
            addOptiTrackStreamTarget(source_node, target_node, stream);
            break;
        case "ULTRAGRID_SEND":
            addUltraGridSendStreamTarget(source_node, stream, target_node.local_ip, source_configuration.settings as UltraGridSend);
            break;
        default:
            throw new SocketException(`Create is not a valid stream source operation for ${source_configuration.software_id}.`);
    }
}

export function resolveCreateStreamTarget(stream: Stream, source_node: Node, target_node: Node) {
    const target_configuration = getStreamConfiguration(target_node, stream.target);

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

export function resolveRemoveStreamSource(stream: Stream, source_node: Node, target_node: Node) {
    const source_configuration = getStreamConfiguration(source_node, stream.source);

    // We need to check if the stream source has already been deleted.
    // This would occur in the case where deletion failed previously and the user is trying again.
    if (stream.source.status != "DELETED") {
        // Resolving service-specific operations for the source node in the stream
        switch (source_configuration.software_id) {
            case "MVN":
                removeMVNStreamTarget(source_node, target_node, stream);
                break;
            case "OPTITRACK":
                removeOptiTrackStreamTarget(source_node, target_node, stream);
                break;
            case "ULTRAGRID_SEND":
                removeUltraGridSendStreamTarget(source_node, stream, target_node.local_ip);
                break;
            default:
                throw new SocketException(`Delete is not a valid stream source operation for ${source_configuration.software_id}.`);
        }
    }
}

export function resolveRemoveStreamTarget(stream: Stream, source_node: Node, target_node: Node) {
    const target_configuration = getStreamConfiguration(target_node, stream.target);

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

function getStreamConfiguration(node: Node, stream_endpoint: StreamSource | StreamTarget) {
    const configuration = node.configurations.find((c) => c.id === stream_endpoint.configuration_id);
    if (!configuration) throw new SocketException(`You cannot edit this stream as ${stream_endpoint.configuration_id} is not registered with node '${node.machine_alias}' `);

    return configuration;
};