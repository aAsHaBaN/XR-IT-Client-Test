// TO DO:
// Currently we have no way of interfacing with metaquest and thus, determining if a
// headset is connected. Need to determine if this class is necessary or not.
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
