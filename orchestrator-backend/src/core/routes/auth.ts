import express from 'express';
import { registerUser, signIn } from '../controllers/auth';

export const authRoute = express.Router();

authRoute.post('/signIn', signIn);
authRoute.post('/createUser', registerUser)

export default authRoute;
