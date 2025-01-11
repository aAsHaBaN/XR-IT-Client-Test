import { Request, Response } from "express";
import { getConfiguration as getConfigurationService, getConfigurations as getConfigurationsService, uploadConfiguration as uploadConfigurationService } from "../services/ConfigurationService";
import { isGuidValid } from "../utils/validation";
import { launchOrchestrator } from "../..";
import { inspect } from "node:util";

// Controller function which returns all Orchestrator configurations saved to this machine.
export function getConfigurations(req: Request, res: Response) {
    try {
        res.status(200).json(getConfigurationsService());
    } catch (e) {
        console.log(`\x1b[31m\x1b[1mFailure loading configuration files\x1b[0m`);
        console.log(`\x1b[31m${e}\x1b[0m\n`);
        res.status(500).json(`Failed to load configurations: ${e}`);
    }
}

// Controller function which returns a single Orchestrator configurations saved to this machine with matching id.
export function getConfiguration(req: Request, res: Response) {
    try {
        const id = req.params.id;
        if (!id || !isGuidValid(id)) throw new Error(`${id} is not a valid id.`)

        res.status(200).json(getConfigurationService(id));
    } catch (e) {
        console.log(`\x1b[31m\x1b[1mFailure loading configuration file '${req.params.id}'.\x1b[0m`);
        console.log(`\x1b[31m${e}\x1b[0m\n`);
        res.status(500).json(`Failed to load configuration: ${e}`);
    }
}

/*  
    Controller function which launches a new XR-IT Orchestrator based on a configuration saved to this
    machine whose id matches the parameter of the request. This will terminate the existing network, 
    Orchestrator state, and any existing connections. On success, the state of the new network is returned.
*/
export async function launchConfiguration(req: Request, res: Response) {
    try {
        const id = req.params.id;
        if (!id || !isGuidValid(id)) throw new Error(`${id} is not a valid id.`)
        const configuration = getConfigurationService(id);
        const state = await launchOrchestrator(configuration);

        res.status(200).json(state);
    } catch (e) {
        console.log(`\x1b[31m\x1b[1mFailure launch orchestrator '${req.params.id}'.\x1b[0m`);
        console.log(`\x1b[31m${e}\x1b[0m\n`);
        res.status(500).json(`Failed to launch orchestrator: ${e}`);
    }
}

// Uploads and saves a new configuration to this machine. Configurations are saved in the 'config' directory.
export function uploadConfiguration(req: Request, res: Response) {
    try {
        const config = req.body;
        if (!config) throw new Error(`Must provide a configuration to upload.`)

         console.log(`\x1b[4m\x1b[35mOrchestrator status updated\x1b[0m`);
        console.log(inspect(config, false, null, true));
        console.log();
        
        const config_id = uploadConfigurationService(config);
        res.status(200).json(getConfigurationService(config_id));
    } catch (e) {
        console.log(`\x1b[31m\x1b[1mFailure saving configuration file.\x1b[0m`);
        console.log(`\x1b[31m${e}\x1b[0m\n`);
        res.status(500).json(`Failed to save configuration file: ${e}`);
    }
}