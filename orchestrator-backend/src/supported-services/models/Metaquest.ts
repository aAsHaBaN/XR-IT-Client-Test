export class MetaquestSettings {
  isHeadsetConnected: boolean;

  constructor(isHeadsetConnected: boolean) {
    this.isHeadsetConnected = isHeadsetConnected ? isHeadsetConnected : false;
  }

  static serialize(settings: MetaquestSettings) {
    return {
      isHeadsetConnected: settings.isHeadsetConnected,
    };
  }
}
