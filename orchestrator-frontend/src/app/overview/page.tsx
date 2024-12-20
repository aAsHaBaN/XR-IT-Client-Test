"use client";

import Flow from "./_components/Flow";
import useConfig from "@/hooks/useConfig";
import { Panel, ReactFlowProvider } from "@xyflow/react";
import DiagramService from "./_services/DiagramService";
import useSocket from "@/hooks/useSocket";
import GlobalErrors from "@/components/GlobalErrors";
import NoConfigurationAlert from "@/components/NoConfigurationAlert";

function Home() {
  const { isConnected } = useSocket();

  const { nodes, edges, errors, configurationName } = useConfig(DiagramService);

  return (
    <ReactFlowProvider>
      <Flow configNodes={nodes} configEdges={edges}>
        <Panel position="top-left">
          <div className="flex items-center gap-2 font-bold text-secondary">
            <span>{configurationName}</span>
          </div>
        </Panel>
        <Panel position="top-center">
          {isConnected ? (
            <GlobalErrors errors={errors} />
          ) : (
            <NoConfigurationAlert />
          )}
        </Panel>
      </Flow>
    </ReactFlowProvider>
  );
}

export default Home;
