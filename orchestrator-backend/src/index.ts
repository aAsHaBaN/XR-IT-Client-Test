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

const { DEFAULT_SOCKET_PORT } = constants;

const app = express();
const http_server = createServer(app);

const io = new Server(http_server, {
    cors: {
        methods: ["GET", "POST"],
    },
});

//AuthService.getInstance();

app.use(bodyParser.json());
app.use(authRoute);
app.use('/configurations', configsRoute);

http_server.listen(DEFAULT_SOCKET_PORT, () => {
    console.log(`API and sockets listening on *:${DEFAULT_SOCKET_PORT}\n`);
});

export async function launchOrchestrator(config: any) {
    if (!isGuidValid(config?.id) || typeof (config?.configuration_name) != "string") {
        throw new SocketException("Configuration must have valid name and id")
    } else if (!config.labs) {
        throw new SocketException("Configuration must have labs")
    }

    const current_config_id = ConfigurationService.getCurrentConfigurationId();
    if (current_config_id === config.id) {
        throw new SocketException('This orchestrator configuration is already initialized.')
    }

    if (SoftEtherServer.isRunning()) {
        // If VPN is online, we must stop current hub before launching another.
        await SoftEtherServer.terminate();
    }

    const labs_service = new LabService(config.labs);
    const streams_service = new StreamsService(config.streams);
    const nodes_service = NodesService.initialize(config.nodes);

    const vpn = await SoftEtherServer.initialize(config.vpn, nodes_service.getOrchestratorNode().local_ip);
    const configuration_settings = ConfigurationService.initialize(config.id, config.configuration_name);

    app.post('/registerNode', registerNode)

    NodesNamespace.instantiate(io, labs_service, nodes_service, streams_service);
    InterfacesNamespace.instantiate(io, configuration_settings, vpn, labs_service, nodes_service, streams_service);

    console.log(`\x1b[32mOrchestrator \x1b[1m${configuration_settings.configuration_name}\x1b[0m\x1b[32m instantiated.\x1b[0m\n`)
    return serializeState(configuration_settings, vpn, labs_service.labs, nodes_service.nodes, streams_service.streams, streams_service.pending_streams);
}
