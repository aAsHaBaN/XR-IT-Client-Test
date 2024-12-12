import { createServer } from "http";
import { Server } from "socket.io";
import { NodeService } from "./core/services/XRITNode";
import { constants } from "./core/utils/constants";
import { getArguments } from "./core/utils/arguments";
import { getConfig } from "./core/services/configService";
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
    methods: ["GET", "POST"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type"], // Allowed headers
  })
);

const http_server = createServer(app);
new Server(http_server, {
  cors: {
    methods: ["GET", "POST"],
  },
});


app.use(bodyParser.json());
app.use(ConfigsRoute);
app.use(NodesRoute);

http_server.listen(DEFAULT_SOCKET_PORT, () => {
  console.log(`XR-IT Node API listening on *:${DEFAULT_SOCKET_PORT}\n`);
});

/*
  While the Node front-end is still being developed, we use command-line arguments to auto-launch the VPN and network connection,
  please refer to the README for usage.
*/
if (args.config_id) {
  getConfig(args.config_id, args.config_path).then(async config => {
    if (!config) throw new Error(`Config with id '${args.config_id}' does not exist.`)
    NodeService.getInstance().init(config)
  })
}



