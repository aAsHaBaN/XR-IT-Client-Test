import { NodeServiceInterface } from "./NodeService";
import { Node, Edge } from "@xyflow/react";
import { HandleType, IHandle } from "@/core/handles/diagram";
import { SERVICE_NODES_SIZE } from "./constants";
import { INodeSize } from "./configuration";
import { EdgeType } from "@/core/edges/diagram";
import { CUSTOM_EDGE, ERROR_EDGE, PENDING_EDGE } from "../edges/constants";
import { OFFLINE_EDGE } from "../edges/constants";

export abstract class BaseService implements NodeServiceInterface {
  protected createNode<T extends Record<string, unknown>>(
    nodeId: string,
    type: string,
    data: T,
    isOnline: boolean,
    additionalProps: Partial<Node<T>> = {},
  ): Node<T> {
    return {
      id: nodeId,
      type,
      data: {
        ...data,
        isOnline,
      },
      deletable: false,
      draggable: true,
      style: {
        opacity: 0,
      },
      position: { x: 0, y: 0 },
      ...additionalProps,
    };
  }

  protected createChildNode<T extends Record<string, unknown>>(
    nodeId: string,
    parentId: string,
    type: string,
    data: T,
    isOnline: boolean,
    additionalProps: Partial<Node<T>> = {},
  ): Node<T> {
    return this.createNode(nodeId, type, data, isOnline, {
      parentId,
      extent: "parent",
      draggable: false,
      selectable: false,
      ...additionalProps,
    });
  }

  protected createHandle(
    nodeId: string,
    rootNodeId: string,
    name: string,
    isInput: boolean,
    status: IStreamStatus,
    type: HandleType,
    isConnectable: boolean = false,
    errors: IError[] = [],
  ): IHandle {
    return {
      id: `${nodeId}+${isInput ? "input" : "output"}`,
      nodeId: rootNodeId,
      name,
      status,
      isInput,
      type,
      isConnectable,
      errors,
    };
  }

  static createEdge(
    id: string,
    type: EdgeType,
    source: string,
    target: string,
    sourceHandle: string,
    targetHandle: string,
    additionalProps: Partial<Edge> = {},
  ): Edge {
    return {
      id,
      source,
      target,
      sourceHandle,
      targetHandle,
      type,
      selectable: false,
      deletable: false,
      style: {
        opacity: 0,
      },
      ...additionalProps,
    };
  }

  protected static getEdgeStatus(
    source: IStreamStatus,
    target: IStreamStatus,
  ): IStreamStatus {
    switch (true) {
      case source === "PENDING" ||
        target === "PENDING" ||
        source === "PENDING_DELETE" ||
        target === "PENDING_DELETE":
        return "PENDING";
      case source === "ERROR" || target === "ERROR":
        return "ERROR";
      case source === "OFFLINE" || target === "OFFLINE":
        return "OFFLINE";
      default:
        return "SUCCESS";
    }
  }

  static getEdgeType(
    isNodeOnline: boolean,
    source: IStreamStatus,
    target: IStreamStatus,
  ): EdgeType {
    const status = isNodeOnline
      ? this.getEdgeStatus(source, target)
      : "OFFLINE";
    switch (status) {
      case "PENDING":
        return PENDING_EDGE;
      case "ERROR":
        return ERROR_EDGE;
      case "OFFLINE":
        return OFFLINE_EDGE;
      default:
        return CUSTOM_EDGE;
    }
  }

  protected calculateNodePosition(
    index: number,
    isInput: boolean = false,
    size: Record<string, number> = SERVICE_NODES_SIZE,
  ): { x: number; y: number } {
    const sizes: INodeSize = {
      ...SERVICE_NODES_SIZE,
      ...size,
    };

    if (isInput) {
      return {
        x: 0 + sizes.border,
        y:
          sizes.parentHeader +
          sizes.border +
          (sizes.height + sizes.gap) * index,
      };
    }

    return {
      x: sizes.parentWidth - sizes.width - sizes.border,
      y: sizes.parentHeader + sizes.border + (sizes.height + sizes.gap) * index,
    };
  }

  abstract createNodes(
    config: any,
    node: any,
    labs: any,
    streams: any,
  ): [Node[], Edge[]];
}
