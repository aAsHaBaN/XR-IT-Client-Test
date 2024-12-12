import express from 'express';
import { getConfigs } from '../controllers/config';

export const ConfigsRoute = express.Router()
ConfigsRoute.get('/configurations', getConfigs);
