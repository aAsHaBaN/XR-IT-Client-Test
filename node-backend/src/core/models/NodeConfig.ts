import { SocketException } from "../utils/SocketException";
import { isGuidValid } from "../utils/validation";
import { OrchestratorSocket, SoftEtherClient } from "./SoftEther";

export interface INodeConfig {
    id: string;
    name: string;
    vpn: SoftEtherClient;
    orchestrator_socket: OrchestratorSocket;
}

export class NodeConfig {
    id: string;
    name: string;
    vpn: SoftEtherClient;
    orchestrator_socket: OrchestratorSocket;

    constructor(config: INodeConfig) {
        if (!config.id && isGuidValid(config.id)) throw new SocketException(`Node config must have a valid GUID ID`)
        if (!config.name) throw new SocketException('Node config must have a name.')
        if (!config.orchestrator_socket || !Object.values(config.orchestrator_socket).every(v => v != undefined)) throw new SocketException(`Node config must have an Orchestrator socket defined.`)
        if (!config.vpn || !Object.values(config.vpn).every(v => v != undefined) || !config.vpn.adapter || !Object.values(config.vpn.adapter).every(v => v != undefined))
            throw new SocketException(`Node config must have VPN settings defined.`)

        this.id = config.id;
        this.name = config.name;
        this.vpn = config.vpn;
        this.orchestrator_socket = config.orchestrator_socket;
    }
}