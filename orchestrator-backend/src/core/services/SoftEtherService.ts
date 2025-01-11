import { SocketException } from "../utils/SocketException.js";
import { constants } from "../utils/constants.js";
import { ISoftEtherServer, SoftEtherUser, SoftEtherVirtualHub } from "../models/SoftEther.js";
import { isIP } from "net";
import { getArguments } from "../utils/arguments.js";
import runPowershell from "../utils/powershell.js";

const {
  SOFTETHER_START_HUB_SCRIPT_PATH,
  SOFTETHER_STOP_HUB_SCRIPT_PATH,
  SOFTETHER_START_CLIENT_SCRIPT_PATH,
  SOFTETHER_STOP_CLIENT_SCRIPT_PATH
} = constants;

// Service which maintains and manages the state of an Orchestrator's SoftEther VPN.
// To manage the VPN, we use SoftEther's vpncmd CLI. Please refer to their documentation
// for further understand which operations we are leveraging.
export class SoftEtherServer implements ISoftEtherServer {
  private static instance: SoftEtherServer;
  public_ip: string | undefined;
  local_ip: string | undefined;
  subnet: string | undefined;
  admin: SoftEtherUser | undefined;
  virtual_hub: SoftEtherVirtualHub | undefined;
  is_online: boolean

  private constructor(base: ISoftEtherServer, orchestrator_ip: string) {
    if (base?.public_ip && !isIP(base.public_ip))
      throw new SocketException(`${base.public_ip} is not a valid IPv4.`);
    if (!isIP(orchestrator_ip))
      throw new SocketException(`${base.local_ip} is not a valid IPv4.`);

    this.public_ip = base?.public_ip;
    this.local_ip = orchestrator_ip;
    this.admin = base?.admin;
    this.virtual_hub = base?.virtual_hub;
    this.subnet = base.subnet;
    this.is_online = false;
  }

  /*
    This class follows a singleton pattern, meaning only one instance of it can run on an Orchestrator.
    This instantiation happens when a new Orchestrator function is launched in the launchOrchestrator function
    located in the index.ts file. We do this so that we can keep track of the VPN which is running
    at any given time.

    This initialization function starts the VPN server.
  */
  static async initialize(vpn_config: any, orchestrator_ip: string) {
    SoftEtherServer.instance = new SoftEtherServer(vpn_config, orchestrator_ip)

    // CLI arguments to check if we are using VPN services
    const args = getArguments()
    if (args.start_vpn) {
      // To make the Orchestrator accessible to Nodes which are connected on the VPN
      // We must start the VPN server AS WELL AS connect to that server as a VPN client
      // on the same machine.
      await SoftEtherServer.instance.startHub();
      await SoftEtherServer.instance.startClient();
    }

    return SoftEtherServer.instance;
  }

  // Terminates the VPN server and corresponding client connection
  static async terminate() {
    if (!SoftEtherServer.instance.is_online) throw new SocketException('SoftEther Server is not online, cannot terminate.')

    // CLI arguments to check if we are using VPN services
    const args = getArguments()
    if (args.start_vpn) {
      await SoftEtherServer.instance.stopHub();
      await SoftEtherServer.instance.stopClient();
    }
  }

  // Returns VPN configuration saved to the state.
  static getConfiguration(): ISoftEtherServer {
    if (!SoftEtherServer.instance)
      throw new SocketException(`SoftEtherServer has not been initialized, cannot provide configuration.`)
    return SoftEtherServer.serialize(this.instance) as any as ISoftEtherServer;
  }

  // Provides VPN status, true if VPN Server is active.
  static isRunning(): boolean {
    return SoftEtherServer.instance && SoftEtherServer.instance.is_online;
  }

  static serialize(vpn: ISoftEtherServer) {
    return {
      public_ip: vpn.public_ip,
      local_ip: vpn.local_ip,
      subnet: vpn.subnet,
      admin: vpn.admin ? { name: vpn.admin.name, pw: vpn.admin.pw } : undefined,
      virtual_hub: vpn.virtual_hub ? { name: vpn.virtual_hub.name, pw: vpn.virtual_hub.pw, port: vpn.virtual_hub.port } : undefined,
      is_online: vpn.is_online
    }
  }

  // Internal function which executes a powershell command to start SoftEther VPN using their vpcmd CLI
  private async startHub(): Promise<void> {
    if (!this.virtual_hub?.name || !this.virtual_hub?.port || !this.virtual_hub?.pw || !this.admin?.name || !this.admin?.pw) {
      throw new SocketException(`Virtual Hub and administrator account must be defined before starting the VPN server.`)
    }

    const start_hub_args = [
      { name: "hub_name", val: this.virtual_hub.name },
      { name: "hub_pw", val: this.virtual_hub.pw },
      { name: "account_pw", val: this.admin!.pw },
    ];

    const response = await runPowershell(SOFTETHER_START_HUB_SCRIPT_PATH, start_hub_args);

    if (response.is_successful) {
      this.is_online = true;
    } else {
      throw new SocketException(`Failed to start VPN hub.'`);
    }
  }

  // Internal function which executes a powershell command to stop SoftEther VPN using their vpcmd CLI
  private async stopHub(): Promise<void> {
    if (!this.virtual_hub?.name || !this.virtual_hub?.port || !this.virtual_hub?.pw || !this.admin?.name || !this.admin?.pw) {
      throw new SocketException(`Virtual Hub and administrator account must be defined before starting the VPN server.`)
    }

    const stop_hub_args = [
      { name: "hub_name", val: this.virtual_hub.name },
      { name: "hub_pw", val: this.virtual_hub.pw },
      { name: "account_pw", val: this.admin?.pw }
    ];

    const response = await runPowershell(SOFTETHER_STOP_HUB_SCRIPT_PATH, stop_hub_args);

    if (response.is_successful) {
      this.is_online = false;

    } else {
      throw new SocketException(`Failed to stop virtual hub.`);
    }
  }

  // Internal function which executes a powershell command to start SoftEther VPN client using their vpcmd CLI
  // Note this command must be executed after starting the hub to make the VPN server machine accessible to other
  // machines on the VPN network.
  private async startClient(): Promise<void> {
    try {
      if (!this.virtual_hub?.name) throw new SocketException(`Must define virtual hub name before starting client.`)
      const start_client_args = [{ name: "accountName", val: this.virtual_hub?.name }];

      const result = await runPowershell(SOFTETHER_START_CLIENT_SCRIPT_PATH, start_client_args);

      if (!result.is_successful) {
        throw new SocketException(`Could not start client with account name '${this.virtual_hub?.name}'`);
      }
    } catch (e) {
      console.log("Connecting via VPN client caused error. Likely already connected to the VPN server, continuing...");
    }
  }

  // Internal function which executes a powershell command to stop the SoftEther VPN client using their vpcmd CLI
  private async stopClient(): Promise<void> {
    try {
      if (!this.virtual_hub?.name) throw new SocketException(`Must define virtual hub name before starting client.`)
      const start_client_args = [{ name: "accountName", val: this.virtual_hub?.name }];

      const result = await runPowershell(SOFTETHER_STOP_CLIENT_SCRIPT_PATH, start_client_args);

      if (!result.is_successful) {
        throw new SocketException(`Could not start client with account name '${this.virtual_hub?.name}'`);
      }
    } catch (e) {
      console.log("Stopping VPN client caused error. Likely already connected to the VPN server, continuing...");
    }
  }
}