import { getNodeConfigs } from "../services/configService";
import { getArguments } from "../utils/arguments";
import { Request, Response } from "express";

export async function getConfigs(req: Request, res: Response) {
    try {
        // For development, we load configuration path from command line arguments
        const config_path = getArguments().config_path;
        const configs = await getNodeConfigs(config_path);
        res.status(200).send(configs);
    } catch(e) {
        res.status(500).json({
            success: false,
            message: (e as Error).message,
        });
    }

}