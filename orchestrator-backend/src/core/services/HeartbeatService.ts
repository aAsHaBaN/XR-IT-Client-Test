import { Node } from "../models/Node";
import { NodesService } from "./NodesService";
import { StreamsService } from "./StreamsService";

// Heartbeat for all services on a corresponding node, emits a command to the Node this machine
// corresponds to, which in turn checks if the service is running.
export function beginHeartbeat(node: Node) {
    new Promise(() => {
        setInterval(() => {
            if (node.is_online == true) {
                node.configurations.forEach(service => {
                    node.emit(`${service.software_id}:heartbeat`, service.id);
                });
            }
        }, 5000)
    });
}

// Function which should be called when the Node responds to the Heartbeat request.
export function onReceiveHeartBeatResponse(node: Node, nodes_service: NodesService, streams_service: StreamsService, configuration_id: string, is_running: boolean) {
    var config = node.configurations.find(c => c.id === configuration_id);

    // If service is marked as online in the state, but is found to be offline, we must mark
    // it as such and then set the corresponding streams as offline.
    if (config && !is_running && config.status === "SUCCESS") {
        console.log(`\x1b[31m${config.software_id} has stopped running on node ${node.machine_alias}\x1b[0m\n`);
        config.status = "OFFLINE";
        streams_service.setConfigurationStreamsAsOffline(config.id)

    // Heartbeat detects that the software has come back online, launch the initialization process with saved settings.
    } else if (config && is_running && config.status === "OFFLINE") {
        console.log(`\x1b[34m${config.software_id} detected to be back online on ${node.machine_alias}, launching with saved settings\x1b[0m\n`);
        nodes_service.launchService(node, config);
    }
}