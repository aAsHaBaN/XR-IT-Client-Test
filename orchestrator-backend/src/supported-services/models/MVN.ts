export class MVNSettings {
  hardware: MVNHardware[];
  port: number;

  constructor(port: number, hardware?: any[]) {
    this.port = port;
    this.hardware = hardware ? hardware : [];
  }

  static parse(config: any): MVNSettings {
    return new MVNSettings(config.port, config.hardware);
  }

  static serialize(settings: MVNSettings) {
    return {
      port: settings.port,
      hardware: settings.hardware,
    };
  }
}

export interface MVNHardware {
  id: string;
  hardware_id: "XSENS_SUIT"
}