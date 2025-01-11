import { WebSocketServer, WebSocket } from "ws";
import { UnrealEngineSettings, UnrealEngineInstance } from "../models/UnrealEngine.js";
import { SocketException } from "../../core/utils/SocketException.js";
import { Socket } from "socket.io-client";
import { inspect } from "util";

const UE_PLUGIN_DEFAULT_WS_PORT = 5000;
const UNREAL_ENGINE_SERVICE_ID = "UNREAL_ENGINE"

// Messages names which are sent from this class to the Unreal Engine Plugin
const NODE_TO_UE_EVENTS = {
  SET_UE_CONFIG: "node_to_unreal:set_configuration",
  GET_STATUS: "node_to_unreal:get_status",
  LIST_OF_UE_INSTANCES: "node_to_unreal:unreal-engine-instances",
  MESSAGE_FROM_UE_INSTANCE: "node_to_unreal:message-from-unreal-engine-instance",
  UE_INSTANCE_CONNECTED: "node_to_unreal:unreal-engine-instance-connected",
  UE_INSTANCE_DISCONNECTED: "node_to_unreal:unreal-engine-instance-disconnected",
}
// Expected messages from the Unreal Engine Plugin
const UE_TO_NODE_EVENTS = {
  UE_INITIALIZED: "unreal_to_node:initialized",
  SET_CONFIG_RESULT: "unreal_to_node:set_configuration_result",
  UE_STATUS: "unreal_to_node:status",
  GET_UE_INSTANCES: "unreal_to_node:get-unreal-engine-instances",
  BROADCAST_TO_UE_INSTANCES: "unreal_to_node:broadcast-to-unreal-engine-instances",
}

// Messages which are sent from this class to the Orchestrator
const NODE_TO_ORCHESTRATOR_EVENTS = {
  UE_INITIALIZED: `${UNREAL_ENGINE_SERVICE_ID}:initialized`,
  UE_CLOSED: `${UNREAL_ENGINE_SERVICE_ID}:terminated`,
  UE_STATUS: `${UNREAL_ENGINE_SERVICE_ID}:status`
}

export class UnrealEngineService {
  configuration_id: string;
  private server: WebSocketServer;
  private ue_socket: WebSocket | undefined;
  private xrit_socket: Socket;
  private pending_livelink_update: {
    id: string,
    action: "CREATE" | "DELETE"
  } | undefined;

  constructor(configuration_id: string, settings: UnrealEngineSettings, xrit_socket: Socket) {
    this.configuration_id = configuration_id;
    this.xrit_socket = xrit_socket;
    this.server = new WebSocketServer({ port: UE_PLUGIN_DEFAULT_WS_PORT });
    this.ue_socket = undefined;
    this.pending_livelink_update = undefined;

    var plugin_initialization_status = {
      has_initialized: false,
      has_config_set: false
    }

    console.log("Listening for Unreal Engine XR-IT Plugin...\n");

    this.server.on("connection", (socket) => {
      if (this.ue_socket) {
        console.log("\x1b[31mAnother Unreal Engine instance is already connected to this XR-IT node. Please kill all instances of Unreal Engine and then launch a new one to establish a new connection.\n\x1b[0m");
      } else {
        console.log("\x1b[32m\x1b[1mXR-IT UE Plugin connected\n\x1b[0m");


        // Handles messages from the Unreal Engine Plugin.
        const onMessage = (buffer: string) => {
          if (!xrit_socket || !xrit_socket.active) {
            throw new SocketException("Received message from UE plugin but there is no active connection orchestrator, please connect and try again.");
          }

          const message = buffer.toString();
          const plugin_event_name = message.split("\n")[0]!.trim();

          console.log(`\x1b[4mReceived a message from the Unreal Engine Plugin:\x1b[0m`);
          console.log(`\x1b[34m${plugin_event_name}\x1b[0m`);

          switch (plugin_event_name) {
            case UE_TO_NODE_EVENTS.UE_INITIALIZED:
              onPluginInitialized();
              break;
            case (UE_TO_NODE_EVENTS.UE_STATUS):
              onReceivePluginStatus(message);
              break;
            case (UE_TO_NODE_EVENTS.SET_CONFIG_RESULT):
              onSetPluginConfigResult(message);
              break;
            case (UE_TO_NODE_EVENTS.GET_UE_INSTANCES):
              onGetUnrealEngineInstances();
            case (UE_TO_NODE_EVENTS.BROADCAST_TO_UE_INSTANCES):
              onBroadcastToUnrealInstances(message);
            default:
              throw new SocketException(`Invalid request name or format from the XR-IT Unreal Plugin: ${message}`);
          }

          console.log();
        };

        // Unreal Engine Plugin has initialized, we now send it the initial configuration state to set in Unreal Engine
        // We also update state that plugin has initialized.
        const onPluginInitialized = () => {
          plugin_initialization_status.has_initialized = true;
          this.emitToPlugin(NODE_TO_UE_EVENTS.SET_UE_CONFIG, settings)
        }

        // Receive that status of Unreal Engine Plugin
        // If this is the first time we receive this message, this means that the initialization has completed
        // and plugin has set the status. In this case, we let the Orchestrator the plugin has finished set up.
        // Otherwise we simply forward this status to the Orchestrator.
        const onReceivePluginStatus = (message: string) => {
          var payload = getWebSocketMessagePayload(message)

          if (plugin_initialization_status.has_initialized && !plugin_initialization_status.has_config_set) {
            xrit_socket.emit(NODE_TO_ORCHESTRATOR_EVENTS.UE_INITIALIZED, configuration_id, settings);
            plugin_initialization_status.has_config_set = true;
          } else {
            settings = payload
            xrit_socket.emit(NODE_TO_ORCHESTRATOR_EVENTS.UE_STATUS, payload);
          }
        }

        // Result of Configuration update in Unreal Engine Plugin, here we need to check if there are errors. 
        // If there are errors we pass error message to the Orchestrator machine.
        // Additionally, we need to check if we had made a request to set a stream in Unreal Engine. 
        // Since streams are seperate entities within the XR-IT Orchestrator
        // We need to pass the success or failure of this stream to the Orchestrator.
        const onSetPluginConfigResult = (message: string) => {
          var payload = getWebSocketMessagePayload(message)
          if (this.pending_livelink_update) {
            if (payload.parse_errors.length > 0 || payload.livelink_errors.length > 0) { // Error case
              xrit_socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:stream-source-error`, this.pending_livelink_update.id)
            } else { // Successful creation of stream
              if (this.pending_livelink_update.action === "CREATE")
                xrit_socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:stream-source-added`, this.pending_livelink_update.id)
              else // Successful removal of stream
                xrit_socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:stream-source-removed`, this.pending_livelink_update.id)
            }

            this.pending_livelink_update = undefined;
          }

          // If error, pass along a configuration error to the Orchestrator
          if (payload.parse_errors.length > 0 || payload.livelink_errors.length > 0) {
            xrit_socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:set_configuration_error`, payload);
          }
        }

        // Unreal Engine is requesting a list of all connected Unreal Engine instances, pass this message to the Orchestrator
        // to compile this list.
        const onGetUnrealEngineInstances = () => {
          xrit_socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:get-unreal-engine-instances`);
        }

        // Broadcast a message to all Unreal Engine instances connected to XR-IT, this message is passed along to 
        // Orchestrator to complete this broadcast.
        const onBroadcastToUnrealInstances = (message: any) => {
          var payload = getWebSocketMessagePayload(message)

          if (!payload.name || !payload.body) {
            throw new SocketException(`Unreal Engine Plugin message is improperly formatted: ${payload}`)
          }

          xrit_socket.emit(`${UNREAL_ENGINE_SERVICE_ID}:broadcast-to-unreal-engine-instances`, payload);
        }

        socket.on("message", onMessage);
        socket.onclose = this.onPluginClose.bind(this);

        this.ue_socket = socket;
        console.log("\x1b[32m\x1b[1mWaiting for plugin initialization...\x1b[0m\n");
      }
    });
  }

  // Checks if an Unreal Engine Plugin instance is connected to this Node
  isPluginActive() {
    return !!this.ue_socket
  }

  // On close of the Plugin socket, we terminate this service and send a message to the Orchestrator 
  onPluginClose() {
    this.ue_socket?.close();
    this.ue_socket = undefined;

    console.log("\x1b[31m\x1b[1mXR-IT UE Plugin disconnected\x1b[0m\n");
    this.xrit_socket.emit(NODE_TO_ORCHESTRATOR_EVENTS.UE_CLOSED, this.configuration_id);
  }

  // Sends a message to the Unreal Engine Plugin to update its internal configuration
  setConfiguration(config: UnrealEngineSettings) {
    this.emitToPlugin(NODE_TO_UE_EVENTS.SET_UE_CONFIG, config);
  }

  // Queries the current configuration from the Unreal Engine Plugin
  getConfigurationStatus() {
    this.emitToPlugin(NODE_TO_UE_EVENTS.GET_STATUS, null);
  }

  // Marks a stream as being added within this Node class and then passes a configuration to set within Unreal Engine
  // Note, this configuration should already have the stream added to it.
  addLiveLinkSource(stream_id: string, config: UnrealEngineSettings) {
    this.pending_livelink_update = {
      id: stream_id,
      action: "CREATE"
    }

    this.emitToPlugin(NODE_TO_UE_EVENTS.SET_UE_CONFIG, config);
  }

  // Marks a stream as being removed within this Node class and then passes a configuration to set within Unreal Engine
  // Note, this configuration should already have the stream removed from it.
  removeLiveLinkSource(stream_id: string, config: UnrealEngineSettings) {
    this.pending_livelink_update = {
      id: stream_id,
      action: "DELETE"
    }

    this.emitToPlugin(NODE_TO_UE_EVENTS.SET_UE_CONFIG, config);
  }

  // Sends a list of Unreal Engine plugins connected to this XR-IT network
  sendUnrealEngineList(instances: UnrealEngineInstance[]) {
    this.emitToPlugin(NODE_TO_UE_EVENTS.LIST_OF_UE_INSTANCES, { instances: instances })
  }

  // Provides a message that was sent from a different Unreal Engine instance, along with the instance that sent it
  sendMessageFromUnrealEngineInstance(message: { name: string, body: string }, sending_instance: UnrealEngineInstance) {
    this.emitToPlugin(NODE_TO_UE_EVENTS.MESSAGE_FROM_UE_INSTANCE, { message: message, sending_instance: sending_instance })
  }

  // Notifies that new Unreal Engine instance connected to the XR-IT network
  notifyNodeConnected(connected_instance: UnrealEngineInstance) {
    this.emitToPlugin(NODE_TO_UE_EVENTS.UE_INSTANCE_CONNECTED, { instance: connected_instance });
  }

  // Notifies this Unreal Engine plugin that a different instance has disconnected from the network.s
  notifyNodeDisconnected(disconnected_instance: UnrealEngineInstance) {
    this.emitToPlugin(NODE_TO_UE_EVENTS.UE_INSTANCE_DISCONNECTED, { instance: disconnected_instance });
  }

  // Helper class for sending messages to Unreal Engine plugin
  emitToPlugin(event_name: string, body: any) {
    console.log("\x1b[4mReceived message to send to the Unreal Engine Plugin:\x1b[0m");
    console.log(`\x1b[35m${event_name}\x1b[0m`);
    console.log(`${inspect(body, false, null, true /* enable colors */)}\n`);
    if (!this.ue_socket) {
      console.log(
        `\x1b[33m\x1b[1mXR-IT UE Plugin is not connected, message '${event_name}' not forwarded...\x1b[0m\n`
      );
    } else {
      const message = body ? `${event_name}\n${JSON.stringify(body)}` : event_name;
      this.ue_socket.send(message);
    }
  }
}

// Parses websocket payload
function getWebSocketMessagePayload(message: string) {
  const lines = message.split("\n");
  if (lines.length > 1) {
    try {
      const payload = JSON.parse(lines.slice(1).join("\n"));
      console.log(inspect(payload, { showHidden: false, depth: null, colors: true }))
      return payload
    } catch (e) {
      console.log("\x1b[31m\x1b[1mIncorrectly formatted payload.\n\x1b[0m");
      console.log(inspect(message, { showHidden: false, depth: null, colors: true }))
    }
  }
}
