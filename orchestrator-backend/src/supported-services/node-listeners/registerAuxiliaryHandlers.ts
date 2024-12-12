import registerNodeUEHandlers from "./nodeUEHandlers.js";
import registerNodeMVNHandlers from './nodeMVNHandlers.js'
import registerNodeOptitrackHandlers from './nodeOptitrackHandlers.js'
import registerNodeUltraGridHandlers from './nodeUltraGridHandlers.js'
import { Node } from "../../core/models/Node";
import { NodesService } from "../../core/services/NodesService.js";
import { StreamsService } from "../../core/services/StreamsService.js";

export const registerAuxiliaryNodeHandlers = (node: Node, node_service: NodesService, streams_service: StreamsService) => {
  registerNodeMVNHandlers(node, node_service, streams_service);
  registerNodeOptitrackHandlers(node, node_service, streams_service);
  registerNodeUltraGridHandlers(node, node_service, streams_service);
  registerNodeUEHandlers(node, node_service, streams_service);
};
