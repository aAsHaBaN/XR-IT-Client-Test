export interface ISoftEtherServer {
  public_ip: string | undefined;
  local_ip: string | undefined;
  subnet: string | undefined;
  admin: SoftEtherUser | undefined;
  virtual_hub: SoftEtherVirtualHub | undefined;
  is_online: boolean;
}

export interface SoftEtherUser {
  name: string;
  pw: string; // PURELY FOR DEVELOPMENT --> WE WILL BE USING CERT AUTHENTICATION FOR USERS
}

export interface SoftEtherVirtualHub {
  name: string;
  pw: string; // PURELY FOR DEVELOPMENT --> REMOVE PW REQUIREMENT FOR HUBS
  port: number;
}
