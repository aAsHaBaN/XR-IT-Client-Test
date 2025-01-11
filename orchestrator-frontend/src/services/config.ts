import { getSocket } from "./socket";
import PortManager from "./ports";
import { Node } from "@xyflow/react";
import { IStreamNodeData } from "@/types/diagram";

export interface Source {
  node_id: string;
  configuration_id: string;
  settings?: {};
}

export interface Target {
  node_id: string;
  configuration_id: string;
  entry_point: {
    type: string;
    value: string | number;
  };
  settings?: {};
}

export function emit(event: string, ...data: any) {
  const socket = getSocket();

  if (!socket?.connected) {
    return;
  }

  socket.emit(event, ...data);
}

export function getNodeDataFromId(id: string) {
  const splitId = id.split("+");
  return {
    nodeId: splitId[0],
    configurationId: splitId[1],
  };
}

function getTargetEntryPoint(
  targetSoftwareId: ISoftware,
  configurationId: string,
) {
  switch (targetSoftwareId) {
    case "UNREAL_ENGINE":
      const portManager = PortManager.getInstance();
      const port = portManager.assignPort(configurationId);
      return {
        type: "PORT",
        value: port,
      };
    default:
      return {
        type: "RANDOM",
        value: 1,
      };
  }
}

function getSettings(targetNode: Node<IStreamNodeData>) {
  switch (targetNode.data.software_id) {
    case "ULTRAGRID_RECEIVE":
      return {
        stream_type: targetNode.data.stream_type,
      };
    default:
      return {};
  }
}

export function createEdge(
  sourceNode: Node<IStreamNodeData>,
  targetNode: Node<IStreamNodeData>,
) {
  const socket = getSocket();

  if (!socket?.connected) {
    return;
  }

  const sourceData = getNodeDataFromId(sourceNode.id);
  const targetData = getNodeDataFromId(targetNode.id);

  const source: Source = {
    node_id: sourceData.nodeId,
    configuration_id: sourceData.configurationId,
  };
  const target: Target = {
    node_id: targetData.nodeId,
    configuration_id: targetData.configurationId,
    entry_point: getTargetEntryPoint(
      targetNode.data.software_id,
      targetData.configurationId,
    ),
  };

  socket.emit("create-stream", source, target, getSettings(targetNode));
}

export function deleteEdge(streamId: string) {
  const socket = getSocket();

  if (!socket?.connected) {
    return;
  }

  socket.emit("remove-stream", streamId);
}

export function saveConfiguration(callback: () => void) {
  const socket = getSocket();

  if (!socket?.connected) {
    return;
  }

  socket.emit("config:save-orchestrator-config");
  socket.on("config:orchestrator-config-saved", callback);
}

export function addService(nodeId: string, serviceId: string) {
  const socket = getSocket();

  if (!socket?.connected) {
    return;
  }

  socket.emit("add-node-service", nodeId, serviceId);
}

export function removeService(nodeId: string, configurationId: string) {
  const socket = getSocket();

  if (!socket?.connected) {
    return;
  }

  socket.emit("remove-node-service", nodeId, configurationId);
}

export function updateService(
  nodeId: string,
  configurationId: string,
  settings: any,
) {
  const socket = getSocket();

  if (!socket?.connected) {
    return;
  }

  socket.emit("update-node-service", nodeId, configurationId, settings);
}

export function checkConnection(
  source: Node<IStreamNodeData>,
  target: Node<IStreamNodeData>,
) {
  switch (source.data.software_id) {
    case "ULTRAGRID_SEND":
      return (
        target.data.software_id === "ULTRAGRID_RECEIVE" &&
        source.data.stream_type === target.data.stream_type
      );
    case "MVN":
    case "OPTITRACK":
    case "METAQUEST":
      return target.data.software_id === "UNREAL_ENGINE";
    default:
      return false;
  }
}
