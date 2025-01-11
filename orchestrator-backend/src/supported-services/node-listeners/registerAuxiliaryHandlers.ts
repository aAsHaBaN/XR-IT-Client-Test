import registerNodeUnrealEngineHandlers from "./nodeUnrealEngineHandlers.js";
import registerNodeMVNHandlers from './nodeMVNHandlers.js'
import registerNodeOptitrackHandlers from './nodeOptitrackHandlers.js'
import registerNodeUltraGridHandlers from './nodeUltraGridHandlers.js'
import { Node } from "../../core/models/Node";
import { NodesService } from "../../core/services/NodesService.js";
import { StreamsService } from "../../core/services/StreamsService.js";

// Helper function where handlers for auxilliary services (software supported by XR-IT) are registered
// for a specific node. To execute this operation, this node must have a socket set in its 'socket' parameter,
// which is what the handlers will mind to.

// As more softwares are added to XR-IT, their handlers can be registered here.
export const registerAuxiliaryNodeHandlers = (node: Node, node_service: NodesService, streams_service: StreamsService) => {
  registerNodeMVNHandlers(node, node_service, streams_service);
  registerNodeOptitrackHandlers(node, node_service, streams_service);
  registerNodeUltraGridHandlers(node, node_service, streams_service);
  registerNodeUnrealEngineHandlers(node, node_service, streams_service);
};
