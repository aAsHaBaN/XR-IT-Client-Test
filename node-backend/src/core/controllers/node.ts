import { isIPv4 } from "net";
import { getNodeConfiguration, getNodeConfigurations } from "../services/configurationService";
import { getArguments } from "../utils/arguments";
import { Request, Response } from "express";
import { isValidServiceId } from "../models/XRITServiceID";
import { NodeService } from "../services/XRITNode";
import { SocketException } from "../utils/SocketException";

/*
  Controller for the POST '/registerOrchestratorConnection' request to be issued from the Node front-end interface.
  This listener registers this Node with a new Orchestrator based on a username, password and Orchestrator public static IP.
  If this registration is successful (Orchestrator exists, user credentials and variables provided are valid), the Orchestrator
  returns a configuration that is added to this machine, which can be used to connect to the corresponding network's VPN and Orchestrator.

  On success, it returns a list of all configurations saved with this Node, including the newly registered one.
*/
export async function registerOrchestratorConnection(req: Request, res: Response) {
    try {
        var { name, orchestrator_ip, machine_alias, service_ids, username, password } = req.body
        console.log(`\x1b[36mReceived request to register with XR-IT Orchestrator at ${orchestrator_ip}\n\x1b[0m`);

        if (!name) {
            throw new SocketException('Must provide a name for this configuration.');
        } else if (!orchestrator_ip || !machine_alias || !service_ids || service_ids && !Array.isArray(service_ids) || !username || !password) {
            throw new SocketException('Must provide a valid Orchestrator IP, machine alias, list of service ids, username and password.');
        } else if (orchestrator_ip.trim().toLowerCase() != 'localhost' && !isIPv4(orchestrator_ip)) {
            throw new SocketException(`${orchestrator_ip} is not a valid IPv4 address.`);
        } else if (service_ids.some((si: any) => !isValidServiceId(si))) {
            throw new SocketException('One or more provided service ids are not valid.');
        }

        // TO DO:For now, we are not able to scan audio / visual inputs and outputs of machines, once we have integrated the 
        // UltraGrid SDK, we will need to introduce this functionality. Where, prior to registration with the Orchestrator we
        // scan the current machine and send the results to the Orchestrator.
        const av_inputs: any[] = [];
        const av_outputs: any[] = [];

        // For development, we load configuration path from command line arguments
        const config_path = getArguments().config_path;

        await NodeService.registerConfig(name, orchestrator_ip, machine_alias, service_ids, av_inputs, av_outputs, username, password, config_path)
        const configs = await getNodeConfigurations(config_path);
        res.status(200).send(configs);
    } catch (e) {
        console.log(`\x1b[31mNode registration failed.\x1b[0m`)
        res.status(500).json({ success: false, message: (e as Error).message });
    }
}

/*
  Controller for the POST '/startOrchestratorConnection' to be issued from the Node front-end interface. This
  listeners searches for the configuration which matches the id provided and if found, attempts to create the 
  connection to the XR-IT Orchestrator.

  On success, it returns 'orchestrator-connection-started' on the same socket.
*/
export async function startOrchestratorConnection(req: Request, res: Response) {
    try {
        const id = req.params.id;
        console.log(`\x1b[36mReceived request to launch XR-IT configuration with id ${id}\n\x1b[0m`);

        if (!id) res.status(400).json({ success: false, message: 'Must provide a valid configuration ID to launch' });

        // For development, we load configuration path from command line arguments
        const config_path = getArguments().config_path;
        const config = await getNodeConfiguration(id!, config_path);

        if (!config) res.status(400).json({ success: false, message: `No node with id ${id} exists on the Orchestrator in this configuration.` });

        const node = NodeService.getInstance()
        node.init(config!).then((init_result) => {
            const result = {
                redirect_address: `http://${config?.orchestrator_socket.ip}:3000/overview`
            }

            res.status(200).json(result);
        }).catch((reason) => {
            res.status(400).json({ success: false, message: reason });
        })
    } catch (e) {
        res.status(500).json({ success: false, message: (e as Error).message, });
    }
}

/*
  Controller for the POST '/stopOrchestratorConnection' request to be issued from the Node front-end interface. This
  listeners searches for the configuration which matches the id provided and if found, attempts to create the 
  connection to the XR-IT Orchestrator.

  On success, it returns 'orchestrator-connection-started' on the same socket.
*/
export async function stopOrchestratorConnection(req: Request, res: Response) {
    try {
        // Check if node is running
        const node = NodeService.getInstance();
        if (!node.config) res.status(400).json({ success: false, message: "Node is not connected to an XR-IT network" });

        await node.terminate();
        res.status(200).send({ isTerminated: true });
    } catch (e) {
        res.status(500).json({ success: false, message: (e as Error).message, });
    }
}