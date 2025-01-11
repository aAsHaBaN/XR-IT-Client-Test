interface IOptitrackConfiguration extends INodeConfiguration {
  software_id: "OPTITRACK";
  settings: IOptitrackSettings;
}

type IOptitrackSettings = {
  hardware: IOptitrackHardware[];
};

type IOptitrackHardware = {
  id: string;
  hardware_id: "XSENS_SUIT";
  is_online: boolean;
};
