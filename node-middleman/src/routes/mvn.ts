import { Router, Request, Response, NextFunction } from 'express';
import { addNetworkStreamingTarget, isMVNRunning, launchMVN, removeNetworkStreamingTarget } from '../services/mvnService';
import { MVNStreamingTarget } from '../models/MVN';

export const mvnRoute = Router();

mvnRoute.get('/isRunning', async (req: Request, res: Response, next: NextFunction) => {
    const response = await isMVNRunning()
    res.status(200).json(response);
})

mvnRoute.post('/launch', async (req: Request, res: Response, next: NextFunction) => {
    const response = await launchMVN()
    res.status(200).json(response);
})

mvnRoute.post('/add-streaming-target', async (req: Request, res: Response,  next: NextFunction) => {
    const stream_target: MVNStreamingTarget = req.body.stream_target;
    const response = await addNetworkStreamingTarget(stream_target)

    res.status(200).json(response);
})

mvnRoute.post('/remove-streaming-target', async (req: Request, res: Response,  next: NextFunction) => {
    const stream_target: MVNStreamingTarget = req.body.stream_target;
    const response = await removeNetworkStreamingTarget(stream_target)

    res.status(200).json(response);
})
