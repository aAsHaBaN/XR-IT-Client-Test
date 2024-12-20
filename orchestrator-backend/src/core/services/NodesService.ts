import { Socket } from "socket.io";
import { XRITServiceID, XRITServicesConfig } from "../../supported-services/models/XRITServiceConfig";
import { AudioVisualIO } from "../models/AudioVisualIO";
import { INode, Node } from "../models/Node";
import { StreamSource, StreamTarget } from "../models/Stream";
import { SocketException } from "../utils/SocketException";
import { beginHeartbeat } from "./HeartbeatService";
import { ISoftEtherServer } from "../models/SoftEther";
import { constants } from "../utils/constants";
import { ipToInt, partitionIP } from "../utils/network";
import { isIPv4 } from "node:net";
import { isGuidValid } from "../utils/validation";

const { DEFAULT_SOCKET_PORT, IP_MIN, IP_MAX } = constants;

export class NodesService {
    private static instance: NodesService;
    public nodes: Node[]

    private constructor(nodes: any[]) {
        this.nodes = nodes.map(n => { return new Node(n) })
        const num_orchestrators = this.nodes.filter(n => n.role === 'orchestrator').length

        // If new config does not contain an Orchestrator node, we will create one
        if (num_orchestrators === 0) {
            this.nodes.push(this.createGenericOrchestratorNode())
        } else if (num_orchestrators > 1) {
            throw new SocketException('Configuration cannot contain more than one orchestrator node.')
        }

        this.nodes.find(n => n.role === 'orchestrator')!.is_online = true
    }

    static initialize(nodes: any[]) {
        NodesService.instance = new NodesService(nodes)
        return NodesService.instance;
    }

    static getInstance() {
        if(!NodesService.instance) throw new SocketException('NodesService not instantiated');
        return NodesService.instance
    }

    getNode(id: string): Node {
        const matching_node = this.nodes.find((n) => n.id === id);
        if (!matching_node) throw new SocketException(`No node with id '${id}' is registered with this orchestrator.`);

        return matching_node;
    }

    getOrchestratorNode(): Node {
        const orchestrator = this.nodes.find(n => n.role === "orchestrator");
        if (!orchestrator) throw new SocketException(`No Orchestrator found on this network!`)
        return orchestrator;
    }

    getStreamNode(stream_endpoint: StreamSource | StreamTarget) {
        const node = this.nodes.find((n) => n.id === stream_endpoint.node_id);
        if (!node) throw new SocketException(`Requested stream endpoint ${stream_endpoint.node_id} does not exist.`);
        return node;
    };

    updateNode(id: string, node_settings: INode): Node {
        if(!isIPv4(node_settings.local_ip)) {
            throw new SocketException(`${node_settings.local_ip} is not a valid IPv4 address.`)
        } else if(!isGuidValid(node_settings.lab_id)) {
            throw new SocketException(`Lab ID ${node_settings.lab_id} is not a valid GUID.`)
        }
        
        var node = this.getNode(id);

        if (node.local_ip != node_settings.local_ip) {
            const is_ip_within_range = ipToInt(IP_MIN) < ipToInt(node_settings.local_ip) && ipToInt(node_settings.local_ip) < ipToInt(IP_MAX);
            
            if(!is_ip_within_range) {
                throw new SocketException(`IP address provided for ${node.machine_alias} is out of range.`)
            } else if(this.nodes.some(n => n.local_ip === node_settings.local_ip)) {
                throw new SocketException(`Cannot update IP address of ${node.machine_alias} to ${node_settings.local_ip} as this IP is already in use on this network.`)
            }

            node.emit('update-xrit-network-ip', node.local_ip);
            console.log(`\x1b[33mUpdating the network IP address requires updating the network settings on ${node.machine_alias}. Sent request.\n\x1b[0m`)
        }

        node.lab_id = node_settings.lab_id;
        node.av_inputs = node_settings.av_inputs;
        node.av_outputs = node_settings.av_outputs;

        return node
    }
    
    deregisterNode(id: string) {
        const node = this.getNode(id);
        node.emit('deregister-orchestrator-connection');
        return node;
    }

    onNodeDeregistered(id: string) {
        var node = this.nodes.filter(n => n.id === id)[0];
        if(!node) 
            throw new SocketException(`Cannot remove node with ${id} as it does not exist on this orchestrator.`)
        return node;
    }

    /* 
        Registers a new Node with the active XR-IT Orchestrator network. To do this, it accepts a number of user defined values
        inluding the naming of the node, the lab it should belong to, as well as the services that it has installed on its machine.
        After this, it partitions a private network IP address for this machine and generations a blank template for each service
        provided.
    */
    registerNode(lab_id: string, machine_alias: string, services: XRITServiceID[], av_inputs: AudioVisualIO[], av_outputs: AudioVisualIO[]): Node {
        const id = crypto.randomUUID();
        const ip_address = partitionIP(this.nodes.map(n => { return n.local_ip }))

        const service_configs = [] as XRITServicesConfig[];
        services.forEach(s => {
            service_configs.push(new XRITServicesConfig({ software_id: s }))
        });

        const node = new Node({
            id: id,
            lab_id: lab_id,
            machine_alias: machine_alias,
            role: 'client',
            local_ip: ip_address,
            is_online: false,
            configurations: service_configs,
            av_inputs: av_inputs,
            av_outputs: av_outputs
        });

        this.nodes.push(node);
        return node;
    }

    initNode(id: string, socket: Socket) {
        if (!socket) throw new SocketException(`Invalid socket provided: ${socket}`);

        const node = this.getNode(id);

        node.socket = socket;
        node.is_online = true;
        node.configurations.forEach(c => { this.launchService(node, c) })
        beginHeartbeat(node);

        return node;
    }

    terminateNode(socket_id: string): Node | undefined {
        const matching_node = this.nodes.find((n) => n.socket?.id === socket_id);
        if (matching_node) {
            console.log(`Found node to disconnect: ${matching_node.machine_alias}`);
            matching_node.socket!.disconnect();
            matching_node.socket = undefined;
            matching_node.is_online = false;

            return matching_node
        }

        return undefined
    }

    launchService(node: Node, configuration: XRITServicesConfig) {
        configuration.status = "PENDING";
        node.emit(`${configuration.software_id}:launch`, configuration.id, configuration.settings);
        console.log(`\x1b[34mSent message to ${node.machine_alias} to launch ${configuration.software_id}\x1b[0m\n`)
    }

    onNodeIPChange(id: string, new_ip: string) {
        const node = this.getNode(id)
        node.local_ip = new_ip;
        return node;
    }

    // Generates a standard Orchestrator Node, used when new Orchestrators are created.
    private createGenericOrchestratorNode(): Node {
        const ip = partitionIP(this.nodes.map(n => { return n.local_ip }))

        return new Node({
            id: crypto.randomUUID(),
            lab_id: undefined,
            local_ip: ip,
            machine_alias: "XR-IT Orchestrator",
            role: 'orchestrator',
            is_online: false,
            configurations: [],
            av_inputs: [],
            av_outputs: []
        })
    }

    /*
        Creates a Node-side configuration for a Node that is registered with this Orchestrator network. 
        Using the information stored in this configuration, the Node can then connect to the VPN network 
        that is hosted by the Orchestrator.
    */
    static generateNodeConfig(node: Node, vpn: ISoftEtherServer) {
        if (!vpn || !Object.values(vpn).every(v => v != undefined) || !vpn.virtual_hub || !Object.values(vpn.virtual_hub).every(v => v != undefined))
            throw new SocketException('VPN must be defined before Nodes are registed.');

        var vpn_adapter_name;
        try {
            vpn_adapter_name = `VPN${parseInt(node.local_ip.split(".")[2]!)}`
        } catch {
            throw new SocketException(`Node id does not have a valid IP address.`)
        }

        return {
            id: node.id,
            vpn: {
                name: vpn.virtual_hub.name,
                ip: vpn.public_ip,
                port: vpn.virtual_hub.port,
                username: "damika", // To remove once login functionality complete
                password: "test", //  To remove once login functionality complete
                adapter: {
                    ip: node.local_ip,
                    name: vpn_adapter_name,
                    subnet: vpn.subnet
                }
            },
            orchestrator_socket: {
                ip: vpn.local_ip,
                port: DEFAULT_SOCKET_PORT
            }
        }
    }
}