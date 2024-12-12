import express from 'express';
import { registerUser, signIn } from '../controllers/auth';

export const authRoute = express.Router();

/*
    We have created three routes for authentication functionality within XR-IT. These routes functions are as follows:
    * POST /signIn: User provides a username and password, based on which they receive a JWT token which validates all communication within XR-IT
    * POST /createUser: Creates a new user within XR-IT within a specific lab and configuration
    * POST /registerNode: Registers a new Node to an XR-IT network, this Node is defined with specific services (softwares), an IP address and other critical details.
*/
authRoute.post('/signIn', signIn);
authRoute.post('/createUser', registerUser)

export default authRoute;
