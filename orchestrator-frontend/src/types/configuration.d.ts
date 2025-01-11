type IConfiguration = {
  id: string;
  configuration_name: string;
  vpn: IVpn;
  labs: ILab[];
  nodes: INode[];
  streams: IStream[];
  pending_streams: IStream[];
  errors?: IError[];
};

type INode = {
  id: string;
  lab_id: ILab.id;
  machine_alias: string;
  role: "orchestrator" | "node";
  local_ip: string;
  is_online: boolean;
  configurations: INodeConfiguration[];
  av_inputs: string[];
  av_outputs: string[];
  errors?: IError[];
};

type INodeConfiguration = {
  id: string;
  software_id: ISoftware;
  status: IServiceStatus;
  settings?: Record<string, any>;
  errors?: IError[];
};

type ILab = {
  id: string;
  name: string;
  lab_permissions: ILab.id[];
};

type ISoftware = (typeof software_ids)[number];

type IServiceStatus = (typeof service_statuses)[number];
const service_statuses = [
  "SUCCESS",
  "ERROR",
  "PENDING",
  "UPDATE_PENDING",
  "UNKNOWN",
] as const;

interface IStream {
  id: string;
  source: IStreamSource;
  target: IStreamTarget;
  settings?: Record<string, any>;
  errors?: IError[];
}

interface IStreamSource {
  node_id: string;
  configuration_id: string;
  status: IStreamStatus;
  settings?: Record<string, any>;
  errors?: IError[];
}

interface IStreamTarget {
  node_id: string;
  configuration_id: string;
  entry_point: {
    type: string;
    value: string | number;
  };
  status: IStreamStatus;
  settings?: Record<string, any>;
  errors?: IError[];
}

type IStreamStatus =
  | "SUCCESS"
  | "ERROR"
  | "DELETED"
  | "PENDING"
  | "PENDING_DELETE"
  | "OFFLINE";

type IVpn = {
  public_ip: string;
  local_ip: string;
  client_hub_name: string;
  user: {
    name: string;
    pw: string;
  };
  virtual_hubs: {
    id: string;
    name: string;
    ports: number[];
    pw: string;
  }[];
  errors?: IError[];
};

interface IError {
  code: number;
  message: string;
}
