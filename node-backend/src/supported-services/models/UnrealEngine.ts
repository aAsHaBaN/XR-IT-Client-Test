export const UEServiceID = "UNREAL_ENGINE";

export class UnrealEngineSettings {
  udp_unicast_endpoint: {
    url: string;
    port: number;
  };
  livelink: {
    sources: LiveLinkSource[];
  };

  constructor(udp_unicast_endpoint: any, livelink_sources: any) {
    this.udp_unicast_endpoint = udp_unicast_endpoint;
    this.livelink = { sources: livelink_sources };
  }
}

export interface LiveLinkSource {
  $type: LiveLinkSourceType;
  id: string;
  settings: LiveLinkMvnSourceSettings;
}

export type LiveLinkSourceType = "xrit_unreal::LiveLinkMvnSource" | "xrit_unreal::LiveLinkOptitrackSource" |  "xrit_unreal::LiveLinkMetaquestSource";

export type LiveLinkMvnSourceSettings = {
  port: number;
};
