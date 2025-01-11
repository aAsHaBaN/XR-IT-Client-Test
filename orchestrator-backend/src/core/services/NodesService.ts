import { Socket } from "socket.io";
import { XRITServiceID, XRITServicesConfig } from "../../supported-services/models/XRITServiceConfig";
import { AudioVisualIO } from "../models/AudioVisualIO";
import { INode, Node } from "../models/Node";
import { SocketException } from "../utils/SocketException";
import { beginHeartbeat } from "./HeartbeatService";
import { ISoftEtherServer } from "../models/SoftEther";
import { constants } from "../utils/constants";
import { ipToInt, partitionIP } from "../utils/network";
import { isIPv4 } from "node:net";
import { isGuidValid } from "../utils/validation";
import { UnrealEngineSettings } from "../../supported-services/models/UnrealEngine";
import { setUnrealEngineConfiguration } from "../../supported-services/services/UnrealEngineService";

const { DEFAULT_SOCKET_PORT, IP_MIN, IP_MAX } = constants;

// Service which maintains and manages the state of an Orchestrator's Nodes.
export class NodesService {
    private static instance: NodesService;
    public nodes: Node[]

    private constructor(nodes: any[]) {
        this.nodes = nodes.map(n => { return new Node(n) })
        const num_orchestrators = this.nodes.filter(n => n.role === 'orchestrator').length

        // If new config does not contain an Orchestrator node, we need to create one
        if (num_orchestrators === 0) {
            this.nodes.push(this.createGenericOrchestratorNode())
        } else if (num_orchestrators > 1) {
            throw new SocketException('Configuration cannot contain more than one orchestrator node.')
        }

        this.nodes.find(n => n.role === 'orchestrator')!.is_online = true
    }

    // This class uses a singleton factory, this function is used to initialize the
    // Orchestrator Nodes Service. This service should be initialized only during the
    // launchOrchestrator function in index.ts
    static initialize(nodes: any[]) {
        NodesService.instance = new NodesService(nodes)
        return NodesService.instance;
    }

    // Returns singleton instance of Nodes Service
    static getInstance() {
        if (!NodesService.instance) throw new SocketException('NodesService not instantiated');
        return NodesService.instance
    }

    // Returns node whose id matches
    getNode(id: string): Node {
        const matching_node = this.nodes.find((n) => n.id === id);
        if (!matching_node) throw new SocketException(`No node with id '${id}' is registered with this orchestrator.`);

        return matching_node;
    }

    // Returns the Orchestrator node registered with the current XR-IT network
    getOrchestratorNode(): Node {
        const orchestrator = this.nodes.find(n => n.role === "orchestrator");
        if (!orchestrator) throw new SocketException(`No Orchestrator found on this network!`)
        return orchestrator;
    }

    // Updates a node registered on the current XR-IT network with the settings
    // provided. If the update requires an IP change, this request is forwarded
    // to the corresponding Node for updates on the machine.
    updateNode(id: string, node_settings: INode): Node {
        if (!isIPv4(node_settings.local_ip)) {
            throw new SocketException(`${node_settings.local_ip} is not a valid IPv4 address.`)
        } else if (!isGuidValid(node_settings.lab_id)) {
            throw new SocketException(`Lab ID ${node_settings.lab_id} is not a valid GUID.`)
        }

        var node = this.getNode(id);
        node.lab_id = node_settings.lab_id;
        node.av_inputs = node_settings.av_inputs;
        node.av_outputs = node_settings.av_outputs;

        // Case where update requires IP change
        if (node.local_ip != node_settings.local_ip) {
            // Validate whether the provided IP is in a valid range
            // IP_MIN and IP_MAX are constants which correspond to the range valid in the Trans Realities Lab
            // network. These will need to be moved to environment variable come release time.
            const is_ip_within_range = ipToInt(IP_MIN) < ipToInt(node_settings.local_ip) && ipToInt(node_settings.local_ip) < ipToInt(IP_MAX);

            if (!is_ip_within_range) {
                throw new SocketException(`IP address provided for ${node.machine_alias} is out of range.`)
            } else if (this.nodes.some(n => n.local_ip === node_settings.local_ip)) {
                throw new SocketException(`Cannot update IP address of ${node.machine_alias} to ${node_settings.local_ip} as this IP is already in use on this network.`)
            }

            node.is_online = false;
            node.emit('update-xrit-network-ip', node.local_ip);
            console.log(`\x1b[33mUpdating the network IP address requires updating the network settings on ${node.machine_alias}. Sent request.\n\x1b[0m`)
        }

        return node
    }

    /* 
        Registers a new Node with the active XR-IT Orchestrator network. To do this, it accepts a number of user defined values
        inluding the naming of the node, the lab it should belong to, as well as the services that it has installed on its machine.
        After this, it partitions a private network IP address for this machine and generations a blank template for each service
        provided.
    */
    registerNode(machine_alias: string, lab_id: string|undefined, services: XRITServiceID[], av_inputs: AudioVisualIO[], av_outputs: AudioVisualIO[]): Node {
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
            role: 'node',
            local_ip: ip_address,
            is_online: false,
            configurations: service_configs,
            av_inputs: av_inputs,
            av_outputs: av_outputs
        });

        this.nodes.push(node);
        return node;
    }

    // Initializes a node once it has connected to the XR-IT network. This function
    // will send commands to the Node launch each service that is registered with it
    // as well as start heartbeat monitoring for these services.
    initNode(id: string, socket: Socket) {
        if (!socket) throw new SocketException(`Invalid socket provided: ${socket}`);

        const node = this.getNode(id);

        // Associate the connected socket with this node
        node.socket = socket;
        node.is_online = true;
        node.configurations.forEach(c => { this.launchService(node, c) })
        beginHeartbeat(node);

        return node;
    }

    // Terminates (disconnects) node from this XR-IT network
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

    // Sends a request to deregister node, after which the corresponding Node will complete
    // necessary operations to deregister from the network.
    deregisterNode(id: string) {
        const node = this.getNode(id);
        node.emit('deregister-orchestrator-connection');
        return node;
    }

    // Once a node has deregistered, we can remove it from the network
    onNodeDeregistered(id: string) {
        var node = this.nodes.filter(n => n.id === id)[0];
        if (!node)
            throw new SocketException(`Cannot remove node with ${id} as it does not exist on this orchestrator.`)
        return node;
    }

    // Sends a command to the provided Node to launch a service, if this service exists on this
    // node it will open the application and initialize it according to the configuration settings (if relevant).
    launchService(node: Node, configuration: XRITServicesConfig) {
        configuration.status = "PENDING";
        node.emit(`${configuration.software_id}:launch`, configuration.id, configuration.settings);
        console.log(`\x1b[34mSent message to ${node.machine_alias} to launch ${configuration.software_id}\x1b[0m\n`)
    }

    // Adds a new service to a Node registered on this XR-IT network.
    // If the Node is online, a command is sent to start the service.
    addNodeService(node_id: string, service_id: XRITServiceID, settings?: any) {
        const node = this.getNode(node_id);

        // Only one Unreal Engine, MVN or OptiTrack configuration per node is alloweds
        if (node.configurations.some(c => c.software_id === service_id) && (
            service_id === "UNREAL_ENGINE" ||
            service_id === "OPTITRACK" ||
            service_id === "MVN")) {
            throw new SocketException(`${node.machine_alias} already has an ${service_id} configuration registered and there can only be one at a time.`)
        }

        const configuration = new XRITServicesConfig({
            software_id: service_id,
            status: "PENDING",
            settings: settings
        });

        node.configurations.push(configuration);

        if (node.socket) {
            this.launchService(node, configuration)
        }

        return configuration
    }

    // Removes a service from an Node on this XR-IT network
    removeNodeService(node_id: string, configuration_id: string) {
        const node = this.getNode(node_id);
        if (!node.configurations.some(c => c.id === configuration_id)) 
            throw new SocketException(`No configuration with id '${configuration_id}' exists on Node '${node.id}' `)
        node.configurations = node.configurations.filter(c => c.id != configuration_id);

        return node;
    }

    // Updates a service from an Node on this XR-IT network
    // If relevant an update is sent to the machine to update the settings in the corresponding software
    updateNodeService(node_id: string, configuration_id: string, settings: any) {
        const node = this.getNode(node_id);

        var configuration_index = node.configurations.findIndex(c => c.id === configuration_id)
        if (configuration_index < 0) 
            throw new SocketException(`No configuration with id '${configuration_id}' exists on ${node.machine_alias}`)
        if (node.configurations[configuration_index]?.status === "PENDING" || node.configurations[configuration_index]?.status === "UPDATE_PENDING")
            throw new SocketException(`Cannot update ${node.configurations[configuration_index]!.software_id} on ${node.machine_alias} as it is currently in pending state.`)

        const new_configuration = new XRITServicesConfig({
            id: node.configurations[configuration_index]!.id,
            software_id: node.configurations[configuration_index]!.software_id,
            status: "PENDING",
            settings: settings
        });

        switch (node.configurations[configuration_index]!.software_id) {
            // For these softwares we simply update settings in XR-IT configuration state, no need for additional commands
            case "MVN":
            case "OPTITRACK":
            case "ULTRAGRID_SEND":
            case "ULTRAGRID_RECEIVE":
                new_configuration.status = node.configurations[configuration_index]!.status;
                node.configurations[configuration_index] = new_configuration
                break
                // TO DO: UPDATE ULTRA GRID SEND / RECEIVE STREAMS ONCE UPDATE IS COMPLETE
            // If Unreal Engine is online, we ust send update to Unreal Engine so that settings can be updated in software
            // Otherwise, we simply update the configuration as above.
            case "UNREAL_ENGINE":
                if (node.configurations[configuration_index]!.status === "OFFLINE") {
                    new_configuration.status = node.configurations[configuration_index]!.status;
                    node.configurations[configuration_index] = new_configuration
                } else {
                    setUnrealEngineConfiguration(node, new_configuration.settings as UnrealEngineSettings)
                }
                break;
            default:
                throw new SocketException(`${configuration_id} is not a valid software ID or does not support settings updates.`)
        }

        return node;
    }

    getActiveNodesByService(service_id: XRITServiceID) {
        var nodes: Node[] = [];

        this.nodes.forEach(n => {
            if (n.configurations.some(c => c.software_id === service_id && c.status != "OFFLINE"))
                nodes.push(n);
        })

        return nodes;
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