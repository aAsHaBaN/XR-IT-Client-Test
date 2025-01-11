import express from 'express';
import { getConfigurations, getConfiguration, launchConfiguration, uploadConfiguration } from '../controllers/config';

export const configsRoute = express.Router();

configsRoute.get('/', getConfigurations);
configsRoute.get('/:id', getConfiguration);
configsRoute.post('/upload', uploadConfiguration);
configsRoute.post('/:id/launch/', launchConfiguration)