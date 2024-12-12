import { WebSocketServer, WebSocket } from "ws";
import { UnrealEngineSettings, UEServiceID } from "../models/UnrealEngine.js";
import { SocketException } from "../../core/utils/SocketException.js";
import { Socket } from "socket.io-client";
import { inspect } from "util";

const UE_PLUGIN_DEFAULT_WS_PORT = 5000;

// Messages names which are sent from this class to the Unreal Engine Plugin
const NODE_EVENT_SET_UE_CONFIG = "node_to_unreal:set_configuration";
const NODE_EVENT_UE_GET_STATUS = "node_to_unreal:get_status";

// Expected possible messages from the Unreal Engine Plugin
const PLUGIN_EVENT_UE_INITIALIZED = "unreal_to_node:initialized"
const PLUGIN_EVENT_UE_SET_CONFIG_RESULT = "unreal_to_node:set_configuration_result"
const PLUGIN_EVENT_UE_STATUS = "unreal_to_node:status"

// Messages which are sent from this class to the Orchestrator
const ORCHESTRATOR_EVENT_UE_INITIALIZED = `${UEServiceID}:initialized`;
const ORCHESTRATOR_EVENT_UE_CLOSED = `${UEServiceID}:terminated`
const ORCHESTRATOR_EVENT_UE_STATUS = `${UEServiceID}:status`

export class UnrealEngineService {
  configuration_id: string;
  private server: WebSocketServer;
  private ue_socket: WebSocket | undefined;
  private pending_livelink_update: {
    id: string,
    action: "CREATE" | "DELETE"
  } | undefined;

  constructor(configuration_id: string, settings: UnrealEngineSettings, xrit_socket: Socket) {
    this.configuration_id = configuration_id;
    this.ue_socket = undefined;
    this.pending_livelink_update = undefined;
    this.server = new WebSocketServer({
      port: UE_PLUGIN_DEFAULT_WS_PORT,
    });
    var plugin_initialization_status = {
      has_initialized: false,
      has_config_set: false
    }

    console.log("Listening for Unreal Engine XR-IT Plugin...\n");
    this.server.on("connection", (socket) => {
      if (this.ue_socket) {
        console.log("\x1b[32mNew connection from an Unreal Engine plugin. A connection with a UE plug-in had already established and we will now connect to the new instance. Please note we can only support one UE instance at a time.\n\x1b[0m");
      } else {
        console.log("\x1b[32m\x1b[1mXR-IT UE Plugin connected\n\x1b[0m");
      }

      /* 
        Handles messages from the Unreal Engine Plugin. Currently we have 3 cases and outcomes:
          - Plugin initialized
          - Plugin status
          - Plugin set configuration result

        If it is outside of these three expected cases, we throw an error message.
      */
      const onMessage = (buffer: string) => {
        if (!xrit_socket || !xrit_socket.active) {
          throw new SocketException("Received message from UE plugin but there is no active connection orchestrator, please connect and try again.");
        }

        const message = buffer.toString();
        const plugin_event_name = message.split("\n")[0]!.trim();

        console.log(`\x1b[4mReceived a message from the Unreal Engine Plugin:\x1b[0m`);
        console.log(`\x1b[34m${plugin_event_name}\x1b[0m`);

        switch (plugin_event_name) {
          case PLUGIN_EVENT_UE_INITIALIZED:
            onPluginInitialized();
            break;
          case (PLUGIN_EVENT_UE_STATUS):
            onReceivePluginStatus(message);
            break;
          case (PLUGIN_EVENT_UE_SET_CONFIG_RESULT):
            onSetPluginConfigResult(message);
            break;
          default:
            throw new SocketException(`Invalid request name or format from the XR-IT Unreal Plugin: ${message}`);
        }

        console.log();
      };

      // Unreal Engine Plugin has initialized, we now send it the initial configuration state to set in Unreal Engine
      // We also update state that plugin has initialized.
      const onPluginInitialized = () => {
        plugin_initialization_status.has_initialized = true;
        this.emitToPlugin(NODE_EVENT_SET_UE_CONFIG, settings)
      }

      // Receive that status of Unreal Engine Plugin
      // If this is the first time we receive this message, this means that the initialization has completed
      // and plugin has set the status. In this case, we let the Orchestrator the plugin has finished set up.
      // Otherwise we simply forward this status to the Orchestrator.
      const onReceivePluginStatus = (message: string) => {
        var payload = getWebSocketMessagePayload(message)

        if (plugin_initialization_status.has_initialized && !plugin_initialization_status.has_config_set) {
          xrit_socket.emit(ORCHESTRATOR_EVENT_UE_INITIALIZED, configuration_id, settings);
          plugin_initialization_status.has_config_set = true;
        } else {
          xrit_socket.emit(ORCHESTRATOR_EVENT_UE_STATUS, payload);
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
            xrit_socket.emit(`${UEServiceID}:stream-source-error`, this.pending_livelink_update.id)
          } else { // Successful creation of stream
            if (this.pending_livelink_update.action === "CREATE")
              xrit_socket.emit(`${UEServiceID}:stream-source-added`, this.pending_livelink_update.id)
            else // Successful removal of stream
              xrit_socket.emit(`${UEServiceID}:stream-source-removed`, this.pending_livelink_update.id)
          }

          this.pending_livelink_update = undefined;
        }

        // If error, pass along a configuration error to the Orchestrator
        if (payload.parse_errors.length > 0 || payload.livelink_errors.length > 0) {
          xrit_socket.emit(`${UEServiceID}:set_configuration_error`, payload);
        }
      }

      socket.on("message", onMessage);

      this.ue_socket = socket;
      console.log("\x1b[32m\x1b[1mWaiting for plugin initialization...\x1b[0m\n");
    });
  }

  // Function to terminate the connection to the XR-IT Unreal Engine plugin
  terminate() {
    this.ue_socket?.close();
    this.server.close();
  }

  // On close of the Plugin socket, we send a message to the Orchestrator 
  onPluginClose(configuration_id: string, xrit_socket: Socket) {
    console.log("\x1b[31m\x1b[1mXR-IT UE Plugin disconnected\x1b[0m\n");
    xrit_socket.emit(ORCHESTRATOR_EVENT_UE_CLOSED, configuration_id);
    this.ue_socket = undefined;
  }

  // Sends a message to the Unreal Engine Plugin to update its internal configuration
  setConfiguration(config: UnrealEngineSettings) {
    this.emitToPlugin(NODE_EVENT_SET_UE_CONFIG, config);
  }

  // Queries the current configuration from the Unreal Engine Plugin
  getConfigurationStatus() {
    this.emitToPlugin(NODE_EVENT_UE_GET_STATUS, null);
  }

  // Marks a stream as being added within this Node class and then passes a configuration to set within Unreal Engine
  // Note, this configuration should already have the stream added to it.
  addLiveLinkSource(stream_id: string, config: UnrealEngineSettings) {
    this.pending_livelink_update = {
      id: stream_id,
      action: "CREATE"
    }

    this.emitToPlugin(NODE_EVENT_SET_UE_CONFIG, config);
  }

  // Marks a stream as being removed within this Node class and then passes a configuration to set within Unreal Engine
  // Note, this configuration should already have the stream removed from it.
  removeLiveLinkSource(stream_id: string, config: UnrealEngineSettings) {
    this.pending_livelink_update = {
      id: stream_id,
      action: "DELETE"
    }

    this.emitToPlugin(NODE_EVENT_SET_UE_CONFIG, config);
  }

  // Helper class for sending messages to Unreal Engine plugin
  emitToPlugin(event_name: string, body: any) {
    console.log("\x1b[4mReceived message to send to the Unreal Engine Plugin:\x1b[0m");
    console.log(`\x1b[35m${event_name}\x1b[0m`);
    console.log(`${inspect(body, false, null, true /* enable colors */)}\n`);
    if (!this.ue_socket) {
      console.log(
        `\x1b[33m\x1b[1mXR-IT UE Plugin is not connected, skipping command "${event_name}"...\x1b[0m\n`
      );
    } else {
      const message = body ? `${event_name}\n${JSON.stringify(body)}` : event_name;
      this.ue_socket.send(message);
    }
  }

  // Simple check for if Unreal Engine is running, will implement a proper heartbeat in the future.
  isUnrealEngineRunning() {
    return this.server && this.server.clients.size > 0 as boolean;
  }
}

function getWebSocketMessagePayload(message: string) {
  const lines = message.split("\n");
  if (lines.length > 1) {
    try {
      const payload = JSON.parse(lines.slice(1).join("\n"));
      console.log(inspect(payload, { showHidden: false, depth: null, colors: true }))
      return payload
    } catch (e) {
      throw new SocketException("Incorrectly formatted payload.");
    }
  }
}
