import { XRITServiceID, XRITServicesConfig } from "../models/XRITServiceConfig";
import { SocketException } from "../../core/utils/SocketException";
import { Node } from "../../core/models/Node";
import { Stream } from "../../core/models/Stream";
import { LiveLinkSource, LiveLinkSourceType, UnrealEngineSettings } from "../models/UnrealEngine";

const UE_SERVICE_ID: XRITServiceID = "UNREAL_ENGINE";

export function addUnrealEngineStreamSource(source_node: Node, unreal_node: Node, stream: Stream) {
  var configuration = unreal_node.configurations.find(c => c.id === stream.target.configuration_id);
  if(!configuration) throw new SocketException(`No Unreal Engine configuration exists on ${unreal_node.machine_alias}`)

  var ue_settings = configuration.settings;
  
  const source_type = source_node.configurations.find(c => c.id === stream.source.configuration_id)!.software_id
  const source = {
    $type: getLiveLinkSourceType(source_type),
    id: stream.id
  } as any;


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

  configuration.status = "PENDING";
  ue_settings.livelink.sources.push(source);

  unreal_node.emit(`${UE_SERVICE_ID}:add-stream-source`, stream.id, ue_settings);
  console.log(`Sent request \x1b[36m\x1b[1m${UE_SERVICE_ID}:set-config\x1b[0m to \x1b[36m${unreal_node.machine_alias}...\n\x1b[0m`);
}

export function removeUnrealEngineStreamSource(node: Node, stream: Stream) {
  var configuration = node.configurations.find(c => c.id === stream.target.configuration_id);
  if(!configuration) throw new SocketException(`No Unreal Engine configuration exists on ${node.machine_alias}`)

  var ue_settings = configuration.settings;
  ue_settings.livelink.sources = ue_settings.livelink.sources.filter(
    (s: LiveLinkSource) => s.id != stream.id
  );
  
  configuration.status = "PENDING";
  node.emit(`${UE_SERVICE_ID}:remove-stream-source`, stream.id, ue_settings);
  console.log(`Sent request \x1b[36m\x1b[1m${UE_SERVICE_ID}:set-config\x1b[0m to \x1b[36m${node.machine_alias}...\n\x1b[0m`);
}

export function setUnrealEngineConfiguration(node: Node, ue_settings: UnrealEngineSettings) {
  node.emit(`${UE_SERVICE_ID}:set-config`, ue_settings);
}

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
