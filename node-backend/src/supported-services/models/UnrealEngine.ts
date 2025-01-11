export class UnrealEngineSettings {
  udp_unicast_endpoint: UDPUnicastEndpoint;
  livelink: LiveLinkConfiguration;
  role: "master" | "client";

  constructor(udp_unicast_endpoint?: UDPUnicastEndpoint, livelink?: LiveLinkConfiguration, role?: "master" | "client") {
    this.udp_unicast_endpoint = udp_unicast_endpoint ? udp_unicast_endpoint : {
      "url": "127.0.0.1",
      "port": 8000
    }
    this.livelink = livelink ? livelink : { sources: [] }
    this.role = role ? role : "client"
  }

  static serialize(settings: UnrealEngineSettings) {
    return structuredClone(settings);
  }
}

export interface UDPUnicastEndpoint {
  url: string;
  port: number;
}

/*
  Given the structure of the Unreal Engine configuration, we are storing it in
  its entirety within the XRITConfigurationSettings, including existing streams
  which is duplicated from the Stream Service's state.
*/
export interface LiveLinkConfiguration {
  sources: LiveLinkSource[];
}

export interface LiveLinkSource {
  id: string;
  $type: LiveLinkSourceType;
  settings?: LiveLinkMvnSourceSettings;
}

// Current supported LiveLink sources in XR-IT
export type LiveLinkSourceType = "xrit_unreal::LiveLinkMvnSource" | "xrit_unreal::LiveLinkOptitrackSource" | "xrit_unreal::LiveLinkMetaquestSource";

export type LiveLinkMvnSourceSettings = {
  port: number;
};

export interface UnrealEngineInstance {
	id: string,
	ip_address: string,
	role: "master" | "client",
	is_this_instance: boolean
}
