type ILabNodeData = {
  label: string;
  machines: IMachine[];
  isOnline: boolean;
};

type IMachine = {
  id: string;
  ip: string;
  name: string;
  services: IService[];
  errors: IError[];
  isOnline: boolean;
};

type IService = {
  id: string;
  software: ISoftware;
  status: IServiceStatus;
  errors: IError[];
};
