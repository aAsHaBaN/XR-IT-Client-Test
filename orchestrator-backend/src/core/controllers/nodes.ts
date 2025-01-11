import InterfacesNamespace from "../namespaces/InterfacesNamespace";
import { ConfigurationService, getConfiguration } from "../services/ConfigurationService";
import { NodesService } from "../services/NodesService";
import { AuthService } from "../services/authService";
import { getArguments } from "../utils/arguments";
import { Request, Response } from "express";
import { SoftEtherServer } from "../services/SoftEtherService";
import { validPassword } from "../utils/auth";
import { SocketException } from "../utils/SocketException";

/*
  Controller function which is responsible for registering a new Node with an XR-IT network.
  To do this, the request must provide user credentials, XR-IT node information: 
  machine name, the lab it belongs to as well as machine information such as the relevant
  softwares it has installed and available AV inputs / outputs.

  This request is only possible if the requesting User is registered with an XR-IT network / 
  configuration that is actively running. If successful, a configuration will be sent back 
  as a response. Once the machine is registered, to connect to the XR-IT network the Node 
  should use the information in the returned configuration in concert with the user credentials 
  used when registering.
*/
export async function registerNode(req: Request, res: Response) {
    console.log(`Recieved request to register node with configuration.`)

    const { username, password, machine_alias, services, av_inputs, av_outputs } = req.body;
    if (!machine_alias || !services || !av_inputs || !av_outputs) {
        res.status(400).send("Missing required parameters: machine_alias, services, av_inputs, av_outputs");
        return;
    }

    const arg = getArguments();
    let lab_id: string | undefined;
    let config_id: string;

    /* 
        TO DO:

        Now that the authentication service is complete, we will check the user credentials provided by
        the Node against a PostGres DB. We will use the matching user to determine which config and 
        and lab we will register this Node with. BUT, this is only true if we are using the 'use_auth' argument 
        when the orchestrator is launched via the command line. 
        
        Otherwise, we will use the configuration that is currently active, if none is active we throw an error. 
        This will need to be removed in the future. This will require moving all TRL instances in the lab to 
        using authentication.
    */
    if (arg.use_auth) {
        if (!username || !password) {
            res.status(400).send("Username and password are required for authentication");
            return;
        }
        //Validation
        const authService = await AuthService.getInstance();
        const user = await authService.validateUserCredentials(username);

        if (!user || !validPassword(password, user.hash, user.salt)) {
            res.status(400).send("Invalid username or password");
            return;
        }

        lab_id = user.lab_id; // Lab that the user belongs to
        config_id = user.configuration_id // Configuration that the user belongs to

    } else {
        if (!ConfigurationService.getCurrentConfigurationId()) throw new SocketException("Cannot register node as no configuration is currently running")

        // Authentication is turned off
        lab_id = undefined; // Lab ID remains blank
        config_id = ConfigurationService.getCurrentConfigurationId()! // Running configuration
    }

    // Check the Configuration Service to determine the id of the configuration which is currently active
    // If the corresponding user credentials do not match, the node cannot currently register.
    const current_config_id = ConfigurationService.getCurrentConfigurationId();
    if (current_config_id != config_id) {
        console.log(`New Node attempted to register with configuration '' but this configuration is not currently running.`)
        res.status(400).send(`The XR-IT network you belong to is currently offline.`)
        return
    }

    const node = NodesService.getInstance().registerNode(req.body.machine_alias, lab_id, req.body.services, req.body.av_inputs, req.body.av_outputs);
    const vpn = SoftEtherServer.getConfiguration();

    // Information in this configuration is used when the user connects to the VPN  and Socket.IO servers 
    // running on this Orchestrator. 
    const node_config = NodesService.generateNodeConfig(node, vpn);

    InterfacesNamespace.emitConfigUpdate();
    res.status(200).send(node_config);
}