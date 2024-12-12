export class OptiTrackSettings {
  hardware: OptiTrackHardware[];

  constructor(hardware?: any[]) {
    this.hardware = hardware ? hardware : [];
  }
  
  static serialize(settings: OptiTrackSettings) {
    return {
      hardware: settings.hardware,
    };
  }
}

export interface OptiTrackHardware {
    id: string;
    hardware_id: "OPTITRACK_SUIT"
}