export class MVNSettings {
  hardware: MVNHardware[];

  constructor(hardware?: any[]) {
    this.hardware = hardware ? hardware : [];
  }

  static parse(config: any): MVNSettings {
    return new MVNSettings(config.hardware);
  }

  static serialize(settings: MVNSettings) {
    return {
      hardware: settings.hardware,
    };
  }
}

export interface MVNHardware {
  id: string;
  hardware_id: "XSENS_SUIT"
}