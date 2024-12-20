import { NodeService } from "../../core/services/XRITNode.js";
import registerMVNHandlers from "./orchestratorMVNHandlers.js"
import registerOptitrackHandlers from './orchestratorOptitrackHandlers.js'
import registerUEHandlers from "./orchestratorUEHandlers.js";
import registerUltraGridHandlers from "./orchestratorUltraGridHandlers.js";

import { Socket } from "socket.io-client";

export const registerAuxiliaryHandlers = (socket: Socket, node: NodeService) => {
    registerMVNHandlers(socket);
    registerOptitrackHandlers(socket, node)
    registerUltraGridHandlers(socket);
    registerUEHandlers(socket, node);
}