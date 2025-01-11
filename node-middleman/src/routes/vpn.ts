import { Router, Request, Response, NextFunction } from 'express';
import { SoftEtherClient } from '../models/SoftEther';
import { createVPNSetting, removeVPNSetting, startupVPN, shutdownVPN, removeVPNAdapter } from '../services/vpnService';

export const vpnRoute = Router();

vpnRoute.post('/', async (req: Request, res: Response, next: NextFunction) => {

    const vpnData: SoftEtherClient = req.body.vpn;
    //const script_path = build_path("/src/ConnectClient.ps1");
    //const scriptResponce= await runPowershell(script_path, []);
    const response = await createVPNSetting(vpnData)

    res.status(200).json(response);//.send('VPN Settigns created successfully');
})

vpnRoute.delete('/', async (req: Request, res: Response, next: NextFunction) => {

    const { vpnName } = req.body;
    
    const response = await removeVPNSetting(vpnName)

    res.status(200).json(response);
})

vpnRoute.post('/start', async (req: Request, res: Response,  next: NextFunction) => {

    const vpnName: string = req.body.vpnName;
    const response = await startupVPN(vpnName)

    res.status(200).json(response);
})

vpnRoute.post('/stop', async (req: Request, res: Response,  next: NextFunction) => {
    
    const vpnName: string = req.body.vpnName;
    const response = await shutdownVPN(vpnName)

    res.status(200).json(response);
})

vpnRoute.post('/remove-addapter', async (req: Request, res: Response,  next: NextFunction) => {
    
    const addapterName: string = req.body.addapterName;
    const response = await removeVPNAdapter(addapterName)

    res.status(200).json(response);
})
