import { getNodeConfigurations } from "../services/configurationService";
import { getArguments } from "../utils/arguments";
import { Request, Response } from "express";

// Loads node configurations from the 'config' folder. These configurations are used
// to manage connections to XR-IT networks.
export async function getConfigs(req: Request, res: Response) {
    try {
        // Load path of configuration file
        const config_path = getArguments().config_path;
        const configs = await getNodeConfigurations(config_path);
        res.status(200).send(configs);
    } catch(e) {
        res.status(500).json({
            success: false,
            message: (e as Error).message,
        });
    }

}