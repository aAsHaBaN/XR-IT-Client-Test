"use client";

import Flow from "./_components/Flow";
import useConfig from "@/hooks/useConfig";
import { ReactFlowProvider } from "@xyflow/react";
import DiagramService from "./_services/DiagramService";

function Home() {
  const { nodes, edges, errors } = useConfig(DiagramService);

  return (
    <ReactFlowProvider>
      <Flow configNodes={nodes} configEdges={edges} errors={errors} />
    </ReactFlowProvider>
  );
}

export default Home;
