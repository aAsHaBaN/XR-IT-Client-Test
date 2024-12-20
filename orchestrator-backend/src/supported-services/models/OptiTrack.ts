export class OptiTrackSettings {
  hardware: OptiTrackHardware[];
  is_streaming_enabled: boolean;

  constructor(hardware?: any[], is_streaming_enabled?: boolean) {
    this.hardware = hardware ? hardware : [];
    this.is_streaming_enabled = is_streaming_enabled ? true : false;
  }
  
  static serialize(settings: OptiTrackSettings) {
    return {
      is_streaming_enabled: settings.is_streaming_enabled,
      hardware: settings.hardware,
    };
  }
}

export interface OptiTrackHardware {
    id: string;
    hardware_id: "OPTITRACK_SUIT"
}