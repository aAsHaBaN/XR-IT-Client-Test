export class UnrealEngineSettings {
  udp_unicast_endpoint: UDPUnicastEndpoint;
  livelink: LiveLinkConfiguration;

  constructor(udp_unicast_endpoint?: UDPUnicastEndpoint, livelink?: LiveLinkConfiguration) {
    this.udp_unicast_endpoint = udp_unicast_endpoint ? udp_unicast_endpoint : {
      "url": "127.0.0.1",
      "port": 8000
    }
    this.livelink = livelink ? livelink : { sources: [] }
  }

  static serialize(settings: UnrealEngineSettings) {
    return structuredClone(settings);
  }
}

export interface UDPUnicastEndpoint {
  url: string;
  port: number;
}

export interface LiveLinkConfiguration {
  sources: LiveLinkSource[];
}

export interface LiveLinkSource {
  id: string;
  $type: LiveLinkSourceType;
  settings: LiveLinkMvnSourceSettings;
}

export type LiveLinkSourceType = "xrit_unreal::LiveLinkMvnSource" | "xrit_unreal::LiveLinkOptitrackSource" | "xrit_unreal::LiveLinkMetaquestSource";

export type LiveLinkMvnSourceSettings = {
  port: number;
};