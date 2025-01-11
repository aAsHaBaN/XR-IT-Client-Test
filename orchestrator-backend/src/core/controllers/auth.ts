import { Request, Response } from "express";
import { AuthService } from "../services/authService";

/*
  Controller file for authentication within XR-IT. This file is responsible 
  for parsing HTTP requests for pertinent information (including relevant variables, parameters)
  and forwarding these data structures to relevant business operations within the XR-IT
  Orchestrator. Once these relevant operations have completed, this controller converts the 
  result into an HTTP readable response.
*/


const green = '\x1b[32m';
const reset = '\x1b[0m';

function logGreen(message: string) {
  console.log(`${green}${message}${reset}\n`);
}

/*
  Sign in controller method for XR-IT authentication. Here, the user will have provided
  a username and password in the request body. On successful authentication, a valid JWT
  token is returned in the HTTP response. If the username or password are invalid a 400
  BAD REQUEST response is returned.
*/
export async function signIn(req: Request, res: Response) {
  logGreen(`New authentication request: ${req.path}`);
  console.log("Request Body:", req.body);
  console.log();

  try {
    // Let's add a check to see if these values exist
    const { username, password } = req.body;
    // Because we are a singleton pattern, we grab the single instance 
    // of the Authentication service running in XR-IT
    const auth = await AuthService.getInstance();
    // We try to generate a JWT using the username and
    const jwt = await auth.getJWT(username, password);

    // If the JWT is null, this means that the username or password are invalid
    if (!jwt) {
      res.status(400).send(`Username or password is invalid.`)
      return;
    }

    res.status(200).json({
      token: jwt!.token,
      expiresIn: jwt!.expires,
    });
  } catch (err) {
    console.error("Error in signIn:", (err as Error).message);
    res.status(500).json({
      success: false,
      message: (err as Error).message,
    });
  }
}

/*
  Register User controller method for XR-IT authentication. Here, the user will have provided
  a username, password, lab id and configuration id in the request body. Using this information
  a user object will be constructed and added to the XR-IT user database table. On success
  a user object is returned, minus the password details. If the user data is invalid a 400
  BAD REQUEST response is returned.

*/
export async function registerUser(req: Request, res: Response) {
  logGreen(`New create user request: ${req.path}`);
  console.log("Request Body:", req.body);
  console.log();

  const { username, password, lab_id, configuration_id } = req.body;
  if (!username || !password || !lab_id || !configuration_id) {
    res.status(400).send(`Missing the required fields: username, password, lab id, configuration id.`);
    return;
  }

  try {
    // As before, we grab the instance of the Authentication service running in XR-IT
    const auth = await AuthService.getInstance();
    const user = await auth.createUser(username, password, lab_id, configuration_id);

    // Remove the password information from the return object as this is sensitive!
    delete user.salt;
    delete user.hash;
    res.status(200).json({ user: user });
  } catch (e) {
    res.status(400).json({
      message: (e as Error).message,
    });
  }
}