import { Edge, Node } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import useSocket from "./useSocket";
import { DiagramServiceInterface } from "@/types/diagram";

export default function useConfig(diagramService: DiagramServiceInterface) {
  const { isConnected, emit, listen, off } = useSocket();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [labs, setLabs] = useState<ILab[]>([]);
  const [configName, setConfigName] = useState<string>("");
  const [config, setConfig] = useState<IConfiguration | null>(null);
  const [errors, setErrors] = useState<IError[]>([]);

  const configUpdate = useCallback(
    (config: IConfiguration) => {
      const { nodes, edges, labs } = diagramService.generateDiagram(config);

      setNodes(nodes);
      setEdges(edges);
      setLabs(labs);

      setConfigName(config.configuration_name);
      setConfig(config);
      setErrors(() => [
        ...(config.errors || []),
        ...(config.vpn?.errors || []),
      ]);
    },
    [diagramService],
  );

  const loadConfig = useCallback(() => {
    emit("config:get-orchestrator-config");
    listen("config:orchestrator-config", (config) => {
      console.info("Event: config:orchestrator-config");
      configUpdate(config);
    });
  }, [configUpdate, emit, listen]);

  const listenToConfigUpdate = useCallback(() => {
    listen("config:orchestrator-config-updated", (config) => {
      console.info("Event: config:orchestrator-config-updated");
      configUpdate(config);
    });
  }, [configUpdate, listen]);

  const stopListening = useCallback(() => {
    off("config:orchestrator-config-updated");
    off("config:orchestrator-config");
  }, [off]);

  useEffect(() => {
    loadConfig();
    listenToConfigUpdate();

    return () => {
      stopListening();
    };
  }, [isConnected, loadConfig, listenToConfigUpdate, stopListening]);

  return {
    nodes,
    setNodes,
    edges,
    labs,
    configurationName: configName,
    config,
    errors,
  };
}
