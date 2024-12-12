import { type Edge, type Node } from "@xyflow/react";

type IServiceNodeData = {
  label: ISoftware;
  ip: string;
  lab: string;
  machine: string;
  isOnline: boolean;
  status: IServiceStatus;
  inputs: string[];
  outputs: string[];
  port?: number;
  hasConnections: boolean;
  minified?: boolean;
  errors?: IError[];
  nodeErrors?: IError[];
};

interface IStreamNodeData extends Record<string, any> {
  label: string;
  isOnline: boolean;
  input?: IHandle;
  output?: IHandle;
  status: "existing" | "new";
  software_id: ISoftware;
}

interface DiagramServiceInterface {
  generateDiagram(config: IConfiguration): {
    nodes: Node[];
    edges: Edge[];
    labs: ILab[];
  };
}
