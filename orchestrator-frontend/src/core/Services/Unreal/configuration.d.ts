interface IUnrealConfiguration extends INodeConfiguration {
  software_id: "UNREAL_ENGINE";
  settings: IUnrealSettings;
}

type IUnrealSettings = {
  livelink: IUnrealStream[];
  udp_unicast_endpoint: IUnrealUnicastEndpoint;
};

type IUnrealStream = {
  sources: {
    id: string;
    type: ISoftware;
    settings: {
      port: number;
    };
  };
};

type IUnrealUnicastEndpoint = {
  url: string;
  port: number;
};
