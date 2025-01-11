import { NodeService } from "../../core/services/XRITNode.js";
import registerMVNHandlers from "./orchestratorMVNHandlers.js"
import registerOptitrackHandlers from './orchestratorOptitrackHandlers.js'
import registerUnrealEngineHandlers from "./orchestratorUnrealEngineHandlers.js";
import registerUltraGridHandlers from "./orchestratorUltraGridHandlers.js";

import { Socket } from "socket.io-client";

// Helper function where handlers for auxilliary services (software supported by XR-IT) are registered
// for this node. To execute this operation, this node must be connected to an XR-IT network.

// As more softwares are added to XR-IT, their handlers can be registered here.
export const registerAuxiliaryHandlers = (socket: Socket, node: NodeService) => {
    registerMVNHandlers(socket);
    registerOptitrackHandlers(socket, node)
    registerUltraGridHandlers(socket);
    registerUnrealEngineHandlers(socket, node);
}