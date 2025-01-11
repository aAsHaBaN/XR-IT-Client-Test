import { SocketException } from "../../core/utils/SocketException";
import { MetaquestSettings } from "./Metaquest";
import { MVNSettings } from "./MVN";
import { OptiTrackSettings } from "./OptiTrack";
import { UltraGridReceive, UltraGridSend } from "./UltraGrid";
import { UnrealEngineSettings } from "./UnrealEngine";

export interface IXRITServicesConfig {
  id?: string;
  software_id: XRITServiceID;
  status?: XRITServiceStatus;
  settings?: any;
  error?: XRITServiceError;
}

export class XRITServicesConfig {
  public id: string;
  public software_id: XRITServiceID;
  public status: XRITServiceStatus;
  public settings?: any;
  public error?: XRITServiceError;

  constructor(base: IXRITServicesConfig) {
    if (!isValidServiceId(base.software_id))
      throw new SocketException(`${base.software_id} is not a valid software id.`);
    if (base.status && !isValidServiceStatus(base.status))
      throw new SocketException(`${base.status} is not a valid service status.`);

    this.software_id = base.software_id as XRITServiceID;
    this.id = base.id ? base.id : crypto.randomUUID();
    this.status = base.status ? base.status : "OFFLINE";
    this.settings = createXRITServiceSettings(this.software_id, base.settings)
  }

  static serialize(config: XRITServicesConfig) {
    return {
      id: config.id,
      software_id: config.software_id,
      status: config.status,
      settings: config.settings ? serializeServiceSettings(config.software_id, config.settings) : {},
      error: config.error,
    };
  }
}

export type XRITServiceID = (typeof software_ids)[number];
const software_ids = [
  "MVN",
  "METAQUEST",
  "OPTITRACK",
  "ULTRAGRID_SEND",
  "ULTRAGRID_RECEIVE",
  "UNREAL_ENGINE",
  "UNREAL_ENGINE_CHARACTER",
  "UNREAL_ENGINE_HMD",
  "UNREAL_ENGINE_CAMERA",
  "UNREAL_ENGINE_BLACKMAGIC_SEND",
  "UNREAL_ENGINE_ULTRAGRID_SEND",
] as const;
const isValidServiceId = (service: any) => {
  return software_ids.includes(service);
};

export type XRITServiceStatus = (typeof service_statuses)[number];
const service_statuses = [
  "SUCCESS",
  "ERROR",
  "PENDING",
  "UPDATE_PENDING",
  "OFFLINE",
  "DISABLED",
] as const;
const isValidServiceStatus = (service: any) => {
  return service_statuses.includes(service);
};

export interface XRITServiceError {
  error: string;
  message: string;
}

// Resolves the creation of XRIT Service settings and parses them accordingly
function createXRITServiceSettings(software_id: XRITServiceID, settings: any | undefined) {
  switch (software_id) {
    case "MVN":
      const mvn_settings = settings as MVNSettings
      return new MVNSettings(mvn_settings?.hardware);
    case "OPTITRACK":
      const optitrack_settings = settings as OptiTrackSettings
      return new OptiTrackSettings(optitrack_settings?.hardware);
    case "METAQUEST":
      const metaquest_settings = settings as MetaquestSettings
      return new MetaquestSettings(metaquest_settings?.isHeadsetConnected);
    case "ULTRAGRID_SEND":
      const ug_send_settings = settings as UltraGridSend
      return new UltraGridSend(ug_send_settings.video?.source_name,
        ug_send_settings?.video?.resolution,
        ug_send_settings?.video?.compression,
        ug_send_settings?.video?.frame_rate,
        ug_send_settings?.video?.codec,
        ug_send_settings?.audio?.source_name,
        ug_send_settings?.audio?.compression,
        ug_send_settings?.audio?.codec);
    case "ULTRAGRID_RECEIVE":
      const ug_receive_settings = settings as UltraGridReceive
      return new UltraGridReceive(ug_receive_settings?.video_output, ug_receive_settings?.audio_output);
    case "UNREAL_ENGINE":
      const ue_settings = settings as UnrealEngineSettings
      return new UnrealEngineSettings(ue_settings?.udp_unicast_endpoint, ue_settings?.livelink);
    default:
      throw new SocketException(`${software_id} is not a supported software id.`);
  }
}

// Resoles and serializes XR-IT Software Settings accordingly
function serializeServiceSettings(service_id: string, settings: any) {
  switch (service_id) {
    case "MVN": return MVNSettings.serialize(settings as MVNSettings);
    case "OPTITRACK": return OptiTrackSettings.serialize(settings as OptiTrackSettings)
    case "METAQUEST": return MetaquestSettings.serialize(settings as MetaquestSettings)
    case "ULTRAGRID_SEND": return UltraGridSend.serialize(settings as UltraGridSend)
    case "ULTRAGRID_RECEIVE": return UltraGridReceive.serialize(settings as UltraGridReceive)
    case "UNREAL_ENGINE": return UnrealEngineSettings.serialize(settings as UnrealEngineSettings)
    default: throw new SocketException(`${service_id} is not a supported software id.`);
  }
}