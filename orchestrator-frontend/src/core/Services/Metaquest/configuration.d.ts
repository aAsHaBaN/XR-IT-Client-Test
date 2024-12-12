interface IMetaquestConfiguration extends INodeConfiguration {
  software_id: "METAQUEST";
  settings: IMetaquestSettings;
}

type IMetaquestSettings = {
  isHeadsetConnected: boolean;
};
