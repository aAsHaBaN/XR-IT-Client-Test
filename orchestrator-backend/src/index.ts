import { createServer } from "http";
import { Server } from "socket.io";
import { constants } from "./core/utils/constants";
import express from "express";
import bodyParser from "body-parser";
import { authRoute } from "./core/routes/auth";
import { configsRoute } from "./core/routes/config";
import { registerNode } from "./core/controllers/nodes";
import InterfacesNamespace from "./core/namespaces/InterfacesNamespace";
import NodesNamespace from "./core/namespaces/NodesNamespace";
import { ConfigurationService, serializeState } from "./core/services/ConfigurationService";
import { LabService } from "./core/services/LabService";
import { NodesService } from "./core/services/NodesService";
import { SoftEtherServer } from "./core/services/SoftEtherService";
import { StreamsService } from "./core/services/StreamsService";
import { SocketException } from "./core/utils/SocketException";
import { isGuidValid } from "./core/utils/validation";
import { AuthService } from "./core/services/authService";
import { getArguments } from "./core/utils/arguments";

const { DEFAULT_SOCKET_PORT } = constants;

const app = express();
const http_server = createServer(app);

const io = new Server(http_server, {
    cors: {
        methods: ["GET", "POST"],
    },
});

const args = getArguments();

// Check if authentication is enabled via the command line launch
if (args.use_auth) {
    console.log("Authentication is enabled. Initializing AuthService...");
    try {
        AuthService.getInstance().then(() => {
            console.log("AuthService initialized successfully.");
        })
    } catch (error) {
        console.error("Failed to initialize AuthService:", error);
        process.exit(1); // Exit the application if authService fails to initialize
    }
} else {
    console.log("Authentication is disabled. Skipping AuthService initialization.");
}

app.use(bodyParser.json());
app.use(authRoute);
app.use('/configurations', configsRoute);

http_server.listen(DEFAULT_SOCKET_PORT, () => {
    console.log(`API and sockets listening on *:${DEFAULT_SOCKET_PORT}\n`);
});

/*
    Initialization function that activates an XR-IT network and creates its state
    based on a provided configuration. This function is launched via the
    configurations controller found in: src > core > controllers > config.ts

    Returns a serialized object with the initialized state of the Orchestrator.
*/
export async function launchOrchestrator(config: any) {
    if (!isGuidValid(config?.id) || typeof (config?.configuration_name) != "string") {
        throw new SocketException("Configuration must have valid name and id")
    }

    const current_config_id = ConfigurationService.getCurrentConfigurationId();
    if (current_config_id === config.id) {
        throw new SocketException('This orchestrator configuration is already initialized.')
    }

    // If VPN is online, we must stop the current VPN server before launching another.
    if (SoftEtherServer.isRunning()) {
        await SoftEtherServer.terminate();
    }

    // The variables below comprise an active XR-IT network's state.
    // On every Orchestrator launch, the state is recreated based on a saved configuration.
    const labs_service = new LabService(config.labs);
    const streams_service = new StreamsService(config.streams);
    const nodes_service = NodesService.initialize(config.nodes);
    const vpn = await SoftEtherServer.initialize(config.vpn, nodes_service.getOrchestratorNode().local_ip);
    const configuration_settings = ConfigurationService.initialize(config.id, config.configuration_name);

    // Any routes that should be active only once an Orchestrator is created are registered here.
    app.post('/registerNode', registerNode)

    // Namespaces for the Socket.IO endpoints are recreated on Orchestrator creation.
    // Recreating them here ensures that any existing connections are terminated -- removing users that should not have access.
    NodesNamespace.instantiate(io, labs_service, nodes_service, streams_service);
    InterfacesNamespace.instantiate(io, configuration_settings, vpn, labs_service, nodes_service, streams_service);

    console.log(`\x1b[32mOrchestrator \x1b[1m${configuration_settings.configuration_name}\x1b[0m\x1b[32m instantiated.\x1b[0m\n`)
    return serializeState(configuration_settings, vpn, labs_service.labs, nodes_service.nodes, streams_service.streams, streams_service.pending_streams);
}
