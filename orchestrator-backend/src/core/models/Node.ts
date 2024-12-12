import { isIP } from "net";
import { SocketException } from "../utils/SocketException";
import { Socket } from "socket.io";
import { isGuidValid } from "../utils/validation";
import { XRITServiceID, XRITServicesConfig } from "../../supported-services/models/XRITServiceConfig";
import { AudioVisualIO } from "./AudioVisualIO";

export interface INode {
  id: string;
  lab_id: string | undefined;
  local_ip: string;
  machine_alias: string;
  role: XRITNodeRole;
  is_online: boolean;
  configurations: XRITServicesConfig[];
  av_inputs: AudioVisualIO[];
  av_outputs: AudioVisualIO[];
}

export type XRITNodeRole = "orchestrator" | "node" | "client";

export class Node implements INode {
  socket?: Socket;
  id: string;
  lab_id: string | undefined;
  machine_alias: string;
  role: XRITNodeRole;
  local_ip: string;
  configurations: XRITServicesConfig[];
  is_online: boolean;
  av_inputs: AudioVisualIO[];
  av_outputs: AudioVisualIO[];

  public constructor(base: INode, socket?: Socket) {
    if (!isGuidValid(base.id)) throw new SocketException(`${base.id} is not a valid GUID.`);
    if (base.lab_id && !isGuidValid(base.lab_id))
      throw new SocketException(`${base.lab_id} is not a valid GUID.`);
    if (!isIP(base.local_ip)) throw new SocketException(`${base.local_ip} is not a valid IPv4.`);
    if (!base.machine_alias) throw new SocketException(`Node must have a machine alias.`)
    if (!base.role) throw new SocketException(`Node must have a role.`)
    if (!base.configurations || !Array.isArray(base.configurations)) throw new SocketException(`Node must have configurations.`)
    if (!base.av_inputs || !Array.isArray(base.av_inputs)) throw new SocketException(`Node must have AV inputs.`)
    if (!base.av_outputs || !Array.isArray(base.av_outputs)) throw new SocketException(`Node must have AV outputs.`)


    this.socket = socket;
    this.id = base.id;
    this.lab_id = base.lab_id;
    this.is_online = false;
    this.machine_alias = base.machine_alias;
    this.role = base.role;
    this.local_ip = base.local_ip;
    this.configurations = base.configurations.map((c: any) => new XRITServicesConfig(c));
    this.av_inputs = base.av_inputs;
    this.av_outputs = base.av_outputs;
  }

  emit(command: string, ...args: any) {
    if (!this.socket) {
      throw new SocketException(`No socket is currently registered with Node with id ${this.id}`);
    }

    this.socket.emit(command, ...args);
  }

  getConfiguration(id: string, software_id?: XRITServiceID) {
    const matching_config = this.configurations.find((n) => n.id === id);

    if (!matching_config) throw new SocketException(`No configuration with id '${id}' is registered with node '${this.id}'.`);
    if (software_id && matching_config.software_id != software_id) throw new SocketException('Found configuration and requested configuration do not match.')

    return matching_config;
  }

  static serialize(node: INode) {
    return {
      id: node.id,
      lab_id: node.lab_id,
      machine_alias: node.machine_alias,
      local_ip: node.local_ip,
      is_online: node.is_online,
      configurations: node.configurations.map((c) => {
        return XRITServicesConfig.serialize(c);
      }),
      av_inputs: node.av_inputs,
      av_outputs: node.av_outputs,
      role: node.role,
    };
  }
}
