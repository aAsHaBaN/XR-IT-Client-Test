import { XRITServiceID, XRITServicesConfig } from "../models/XRITServiceConfig";
import { SocketException } from "../../core/utils/SocketException";
import { Node } from "../../core/models/Node";
import { Stream } from "../../core/models/Stream";
import { LiveLinkSource, LiveLinkSourceType, UnrealEngineInstance, UnrealEngineSettings } from "../models/UnrealEngine";

const UE_SERVICE_ID: XRITServiceID = "UNREAL_ENGINE";

// Sends a configuration to the corresponding Node, which includes a new stream to create
export function addUnrealEngineStreamSource(source_node: Node, unreal_node: Node, stream: Stream) {
  // Find corresponding configuration
  var configuration = unreal_node.configurations.find(c => c.id === stream.target.configuration_id);
  if (!configuration) throw new SocketException(`No Unreal Engine configuration exists on ${unreal_node.machine_alias}`)

  var ue_settings = configuration.settings;

  // Create new LiveLink source object
  const source_type = source_node.configurations.find(c => c.id === stream.source.configuration_id)!.software_id
  const source = {
    $type: getLiveLinkSourceType(source_type),
    id: stream.id
  } as any;


  // Set software specific LiveLink settings
  if (source.$type === "xrit_unreal::LiveLinkMvnSource") {
    source.settings = {
      port: stream.target.entry_point.value
    }
  } else if (source.$type === "xrit_unreal::LiveLinkOptitrackSource") {
    source.settings = {
      server_address: source_node.local_ip,
      client_address: unreal_node.local_ip,
      is_multicast: false
    }
  }

  // Add LiveLink source to settings
  configuration.status = "PENDING";
  ue_settings.livelink.sources.push(source);

  // Forward add stream request to corresponding node
  unreal_node.emit(`${UE_SERVICE_ID}:add-stream-source`, stream.id, ue_settings);
  console.log(`Sent request \x1b[36m\x1b[1m${UE_SERVICE_ID}:set-config\x1b[0m to \x1b[36m${unreal_node.machine_alias}...\n\x1b[0m`);
}

// Sends a configuration to the corresponding Node, which includes a removes a stream
export function removeUnrealEngineStreamSource(node: Node, stream: Stream) {
  // Find corresponding configuration
  var configuration = node.configurations.find(c => c.id === stream.target.configuration_id);
  if (!configuration) throw new SocketException(`No Unreal Engine configuration exists on ${node.machine_alias}`)

  // Remove the LiveLink stream source of interest
  var ue_settings = configuration.settings;
  ue_settings.livelink.sources = ue_settings.livelink.sources.filter(
    (s: LiveLinkSource) => s.id != stream.id
  );

  configuration.status = "PENDING";

    // Forward remove stream request to corresponding node
  node.emit(`${UE_SERVICE_ID}:remove-stream-source`, stream.id, ue_settings);
  console.log(`Sent request \x1b[36m\x1b[1m${UE_SERVICE_ID}:set-config\x1b[0m to \x1b[36m${node.machine_alias}...\n\x1b[0m`);
}

// Sends a request to update the Unreal Engine configuration with the settings provided
export function setUnrealEngineConfiguration(node: Node, ue_settings: UnrealEngineSettings) {
  node.emit(`${UE_SERVICE_ID}:set-config`, ue_settings);
}

// Creates an Unreal Engine Plugin instance object from a Node with Unreal Engine enabled
export function transformNodeToUEInstance(node: Node, is_requesting_instance: boolean): UnrealEngineInstance {
  const ue_config = node.configurations.find(c => c.software_id === "UNREAL_ENGINE");
  if (!ue_config) throw new SocketException(`Unreal Engine is not registered with ${node.machine_alias}`)

  return {
    id: ue_config.id,
    ip_address: node.local_ip,
    role: (ue_config.settings as UnrealEngineSettings).role,
    is_this_instance: is_requesting_instance
  }
}

// Sends list of instances running Unreal Engine to a node which requested this
export function sendListOfUnrealEngineInstances(node: Node, instances: UnrealEngineInstance[]) {
  node.emit(`${UE_SERVICE_ID}:unreal-engine-instances`, instances);
}

// Sends a message to an Unreal Engine instance, forwarded from another UE instance on the network
export function sendMessageFromUnrealEngineInstance(node: Node, message: { name: string, body: any }, sending_instance: UnrealEngineInstance) {
  node.emit(`${UE_SERVICE_ID}:message-from-unreal-engine-instance`, message, sending_instance);
}

// Notifies a UE instance that a new UE instance connected to the network
export function notifyOfInstanceConnect(node: Node, connected_instance: UnrealEngineInstance) {
  node.emit(`${UE_SERVICE_ID}:unreal-engine-instance-connected`, connected_instance)
}

// Notifies a UE instance that a UE instance disconnected from the network
export function notifyOfInstanceDisconnect(node: Node, disconnected_instance: UnrealEngineInstance) {
  node.emit(`${UE_SERVICE_ID}:unreal-engine-instance-disconnected`, disconnected_instance)
}

// Maps XR-IT service ID to the Unreal Engine Plugin naming conventions
function getLiveLinkSourceType(xrit_type_name: string): LiveLinkSourceType {
  switch (xrit_type_name) {
    case "MVN":
      return "xrit_unreal::LiveLinkMvnSource";
    case "OPTITRACK":
      return "xrit_unreal::LiveLinkOptitrackSource";
    case "METAQUEST":
      return "xrit_unreal::LiveLinkMetaquestSource";
    default:
      throw new SocketException(`${xrit_type_name} is not a supported Live Link source in XR-IT.`);
  }
}
