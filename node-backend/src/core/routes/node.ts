import express from 'express';
import { registerOrchestratorConnection, startOrchestratorConnection } from '../controllers/node';

export const NodesRoute = express.Router()
NodesRoute.post('/registerOrchestratorConnection', registerOrchestratorConnection);
NodesRoute.post('/startOrchestratorConnection/:id', startOrchestratorConnection);