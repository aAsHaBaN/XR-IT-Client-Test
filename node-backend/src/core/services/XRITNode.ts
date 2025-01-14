import { SocketException } from "../utils/SocketException.js";
import { io, Socket } from "socket.io-client";
import registerOrchestratorStateHandlers from "../listeners/orchestratorStateHandlers.js";
import { registerAuxiliaryHandlers } from "../../supported-services/listeners/registerAuxiliaryHandlers.js";
import { UnrealEngineService } from "../../supported-services/services/unrealEngineService.js";
import { INodeConfig, NodeConfig } from "../models/NodeConfig.js";
import { getArguments } from "../utils/arguments.js";
import axios from "axios";
import { inspect } from "util";
import { AudioVisualIO } from "../models/AudioVisualIO.js";
import { XRITServiceID } from "../models/XRITServiceID.js";
import { writeConfiguration } from "./configurationService.js";
import { constants } from "../utils/constants.js";
import { createVPNSetting, removeVPNAdapter, removeVPNSetting, shutdownVPN, startupVPN } from "./vpnService.js";

const { DEFAULT_ORCHESTRATOR_PORT } = constants

// Service which manages connections to an XR-IT network. This class follows a singleton pattern
// to ensure a single state across the application.
export class NodeService {
  private static instance: NodeService;
  private socket: Socket | undefined;
  config: INodeConfig | undefined;
  unreal_engine_service?: UnrealEngineService;

  private constructor() {
    this.socket = undefined;
    this.config = undefined
  }

  // Returns singleton instance of the class
  static getInstance(): NodeService {
    if (!NodeService.instance) NodeService.instance = new NodeService();
    return NodeService.instance;
  }

  /*
    Initializes this Node with the XR-IT network associated with the configuration provided.
    The second variable, is a flag which instructs the initialization function that the IP
    address of this machine has changed since the last connection to the Orchestrator,
    in which case the Orchestrator must also be informed of this update.
  */
  async init(config: INodeConfig, has_ip_changed?: boolean) {

    this.config = config;

    // NOTE: We check this flag to see if this instance is being run a local development instance of XR-IT (more on this in README)
    // Here we replace the Orchestrator IP in the Node config with localhost as we are mocking XR-IT over a network and instead,
    // all Nodes / Orchestrator are being run on the same machine.
    const is_local_dev = getArguments().is_local_development
    const ip = is_local_dev ? 'localhost' : config.orchestrator_socket.ip;
    const port = config.orchestrator_socket.port;
    var hasConnected = false;

    // If we are not using a local development instance, launch the VPN
    if (!is_local_dev) {
      await createVPNSetting(config.vpn);
      await startupVPN(config.vpn.name);
    }

    return await new Promise((resolve, reject) => {
      const onConnection = () => {
        hasConnected = true;

        console.log(`\x1b[36mMade initial connection with orchestrator @ \x1b[1m${ip}:${port}.\x1b[0m`);
        console.log('\x1b[36mAttempting to sign in with credentials.\x1b[0m');
        console.log();

        // Register messages from the Orchestrator for managing software on this machine
        // as well as this machine's connection to the XR-IT network.
        registerOrchestratorStateHandlers(this.socket!, this);
        registerAuxiliaryHandlers(this.socket!, this);

        // Once a node has connected to a network, we must emit the id of this machine so that
        // the Orchestrator can correctly register this node as online as well as provide instructions
        // for this machine to run software and enable streams. Additionally, if the IP of this machine
        // on the VPN network has changed since last connection, we must notify the Orchestrator.
        if (has_ip_changed) this.socket!.emit(`node-identifier-ip-updated`, config.id)
        else this.socket!.emit("node-identifier", config.id);
      };

      const onDisconnect = async () => {
        if (this.unreal_engine_service) {
          this.unreal_engine_service.onPluginClose();
          this.unreal_engine_service = undefined;
        }

        this.socket = undefined;
        console.log("\x1b[31m\x1b[1mYou have disconnected from the orchestrator.\x1b[30m\n");
      };

      console.log(`Attempting to connect to ${ip} on port ${port}\n`);
      this.socket = io(`http://${ip}:${port}/nodes`, {
        reconnectionDelayMax: 10000,
      });

      const onSignInSuccess = (lab_permissions: { lab_name: string | undefined, permitted_labs: (string | undefined)[] }) => {
        console.log(`\x1b[32mSign in to orchestrator @ \x1b[1m${ip}:${port} successful!\x1b[0m\n`);

        if (lab_permissions.lab_name) {
          console.log(`This node is connected and has permissions based on the following lab: \x1b[32m${lab_permissions.lab_name}\x1b[0m`);
        } else {
          console.log("The Node needs to be registered with a Lab");
        }

        if (lab_permissions.permitted_labs) {
          console.log(`This lab has permissions over all resources in labs: \x1b[32m${lab_permissions.permitted_labs.join(", ")}\x1b[0m`);
        } else {
          console.log("The Node does not have any permissions");
        }

        console.log();
        // Sign in process successful
        resolve({ signInSuccess: true });
      }

      const onSignInError = function (this: NodeService, error_message: string) {
        console.log(`\x1b[31m\x1b[1mSign in failed: \x1b[0m\x1b[31m${error_message}\x1b[0m\n`)
        this.terminate();
        // Sign in process failure
        reject(error_message);
      }

      this.socket.on("connect", onConnection);
      this.socket.on("disconnect", onDisconnect);
      this.socket.on("sign-in-success", onSignInSuccess);
      this.socket.on("sign-in-error", onSignInError.bind(this));
      this.socket.connect();


      setTimeout(() => {
        if (!hasConnected) {
          const error_message = "Connection timeout: no response from the Orchestrator. Check with the administrator see if it is online and your configuration is launched."
          console.log(`\x1b[31m${error_message}\x1b[0m`)
          this.terminate();
          reject(error_message);
        }
      }, 120000)
    });
  }

  // Terminates an existing connection to a XR-IT network
  async terminate() {
    if (!this.socket)
      throw new SocketException("Invalid operation no connection is currently established with an orchestrator.");

    // NOTE: We check this flag to see if this instance is being run a local development instance of XR-IT (more on this in README)
    // If this is the case, we shutdown the VPN
    const is_local_dev = getArguments().is_local_development
    if (!is_local_dev) {
      const vpn_name = this.config?.vpn.name
      if (!vpn_name) throw new SocketException(`Internal error: cannot shutdown VPN as name not defined.`)
      await shutdownVPN(vpn_name);
    }
    
    this.config = undefined;
    this.socket.disconnect();
  }

  // Updates the IP of this machine within an XR-IT VPN network
  async updateNetworkIP(ip_address: string) {
    if (!this.config) throw new SocketException(`No active config, cannot set IP address.`)

    var config = this.config;
    await this.terminate();

    // Remove the current VPN setting
    config.vpn.adapter.ip = ip_address;
    await removeVPNSetting(config.vpn.name);
    await removeVPNAdapter(config.vpn.adapter.name)

    // Initialize Node Service with a configuration containing the updated IP
    await this.init(config, true);
  }

  /* 
    Registers a new node with an Orchestrator found at the public static IP provided. If multiple Orchestrators are hosted at this
    IP, then the configuration matching the credentials provided is used. 
  */
  static async registerConfig(configuration_name: string, orchestrator_ip: string, machine_alias: string, service_ids: XRITServiceID[], av_inputs: AudioVisualIO[], av_outputs: AudioVisualIO[], username: string, password: string, config_path?: string): Promise<INodeConfig> {
    var config;

    try {
      config = (await axios.post(`http://${orchestrator_ip}:${DEFAULT_ORCHESTRATOR_PORT}/registerNode`, {
        machine_alias: machine_alias,
        services: service_ids,
        av_inputs: av_inputs,
        av_outputs: av_outputs,
        username: username,
        password: password,
      })).data;

      config.name = configuration_name;
      config.vpn.ip = orchestrator_ip;

      console.log(`\x1b[32m\x1b[1mNode registration successful!\x1b[0m\n`);
      console.log(`\x1b[36m\x1b[4mNew node configuration saved\x1b[0m`);
      console.log(inspect(config, false, null, true));
      console.log();
    } catch (error: any) {
      console.log(`\x1b[31mFailed to register with orchestrator\n\x1b[0m`);
      throw new SocketException(error.response.data)
    }

    return await writeConfiguration(new NodeConfig(config), config_path);
  }
}