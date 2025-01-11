import { createServer } from "http";
import { Server } from "socket.io";
import { constants } from "./core/utils/constants";
import { getArguments } from "./core/utils/arguments";
import express from "express";
import bodyParser from "body-parser";
import { ConfigsRoute } from "./core/routes/config";
import { NodesRoute } from "./core/routes/node";
import cors from "cors";

const { DEFAULT_SOCKET_PORT } = constants

const args = getArguments();
if (args.default_config) console.log(`\x1b[36mLaunching XR-IT Node using pre-built configuration: ${args.config_path}\n\x1b[0m`);

const app = express();

// Configure CORS middleware for Express
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"], 
    allowedHeaders: ["Content-Type"],
  })
);

const http_server = createServer(app);
new Server(http_server, {
  cors: {
    methods: ["GET", "POST"],
  },
});

/*  
  The XR-IT Node uses an express API to interact with the front-end end interface.
  Once we launch a connection to the Orchestrator, the application leverages Socket.IO
  
  More on this in the Node Service: src > core > services > XRITNode.ts
*/
app.use(bodyParser.json());
app.use(ConfigsRoute);
app.use(NodesRoute);

http_server.listen(DEFAULT_SOCKET_PORT, () => {
  console.log(`XR-IT Node API listening on *:${DEFAULT_SOCKET_PORT}\n`);
});