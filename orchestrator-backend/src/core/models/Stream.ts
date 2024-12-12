import { randomUUID } from "crypto";
import { SocketException } from "../utils/SocketException";

export interface IStream {
  source: StreamSource;
  target: StreamTarget;
  id: string;
  settings?: any;
}

export class Stream {
  public source: StreamSource;
  public target: StreamTarget;
  public id: string;
  settings?: any;

  constructor(source: StreamSource, target: StreamTarget, id?: string, settings?: any) {
    if (!source?.node_id) throw new SocketException(`Stream ${id} is missing source node id.`);
    if (!source?.configuration_id)
      throw new SocketException(`Stream ${id} is missing source configuration id.`);
    if (!target?.node_id) throw new SocketException(`Stream ${id} is missing target node id.`);
    if (!target?.configuration_id)
      throw new SocketException(`Stream ${id} is missing target configuration id.`);
    if (!target?.entry_point?.type || !target?.entry_point?.value)
      throw new SocketException(`Stream ${id} is missing target entry point.`);

    this.id = id ? id : randomUUID();
    this.source = source;
    this.target = target;
    this.settings = settings;

    if (!this.source.status) this.source.status = "OFFLINE";
    if (!this.target.status) this.target.status = "OFFLINE";
  }

  static parse(config: any): Stream {
    return new Stream(config.source, config.target, config.id, config.settings);
  }

  static serialize(stream: IStream) {
    return {
      id: stream.id,
      source: {
        node_id: stream.source.node_id,
        configuration_id: stream.source.configuration_id,
        status: stream.source.status,
      },
      target: {
        node_id: stream.target.node_id,
        configuration_id: stream.target.configuration_id,
        entry_point: stream.target.entry_point,
        status: stream.target.status,
      },
      settings: stream.settings
    };
  }
}

export interface StreamSource {
  node_id: string;
  configuration_id: string;
  status: StreamStatus;
  error?: any;
}

export interface StreamTarget {
  node_id: string;
  configuration_id: string;
  entry_point: {
    type: string;
    value: string | number;
  };
  status: StreamStatus;
  error?: any;
}

export type StreamStatus = (typeof service_statuses)[number];
const service_statuses = [
  "SUCCESS",
  "ERROR",
  "DELETED",
  "PENDING",
  "PENDING_DELETE",
  "OFFLINE",
] as const;
export const isValidStreamStatus = (service: any) => {
  return service_statuses.includes(service);
};
