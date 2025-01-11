interface IMVNConfiguration extends INodeConfiguration {
  software_id: "MVN";
  settings: IMVNSettings;
}

type IMVNSettings = {
  port: number;
  hardware: IMVNHardware[];
};

type IMVNHardware = {
  id: string;
  hardware_id: "XSENS_SUIT";
  is_online: boolean;
};
