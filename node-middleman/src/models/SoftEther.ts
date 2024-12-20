export interface SoftEtherClient {
  name: string;
  ip: string;
  port: number;
  username: string;
  password: string; // PURELY FOR DEVELOPMENT --> WE WILL BE USING CERT AUTHENTICATION FOR USERS
  adapter: VPNAdapter
}

export interface VPNAdapter {
  ip: string;
  name: string;
  subnet: string;
}

export interface OrchestratorSocket {
  ip: string;
  port: number;
}