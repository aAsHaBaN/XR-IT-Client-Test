import { Router, Request, Response, NextFunction } from 'express';
import runPowershell from '../runPowershell';
import { createVPNSetting, removeVPNSetting, shutdownVPN, startupVPN } from '../vpnService';
import { build_path } from '../constants';
import { SoftEtherClient } from '../SoftEther';
const router = Router();

router.post('/vpn', async (req: Request, res: Response, next: NextFunction) => {

    //const vpnData: SoftEtherClient = req.body.vpn;
    const script_path = build_path("/src/ConnectClient.ps1");
    const scriptResponce= await runPowershell(script_path, []);
    //const response = await createVPNSetting(vpnData)

    res.status(200).json(scriptResponce);//.send('VPN Settigns created successfully');
})

router.delete('/vpn', async (req: Request, res: Response, next: NextFunction) => {

    const vpnName: string = req.body.vpnName;
    const response = await removeVPNSetting(vpnName)

    res.status(200).json(response);
})

router.post('/vpn/start', async (req: Request, res: Response,  next: NextFunction) => {

    const vpnName: string = req.body.vpnName;
    const response = await startupVPN(vpnName)

    res.status(200).json(response);
})

router.post('/vpn/stop', async (req: Request, res: Response,  next: NextFunction) => {
    
    const vpnName: string = req.body.vpnName;
    const response = await shutdownVPN(vpnName)

    res.status(200).json(response);
})

export default router;
