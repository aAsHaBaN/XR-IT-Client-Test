"use client";

import { useState } from "react";
import { useEffect } from "react";
import CurrentConfig from "./CurrentConfig";
import ImportConfig from "./ImportConfig";
import LaunchConfig from "./LaunchConfig";
import useSocket from "@/hooks/useSocket";
import CreateConfig from "./CreateConfig";
import Alert from "@/components/Alert";

function Home({
  allConfigurations,
  handleConfigurationSelection,
  handleConfigurationExport,
  handleConfigurationImport,
}: {
  allConfigurations: IConfiguration[];
  handleConfigurationSelection: (
    configurationId: string,
  ) => Promise<IConfiguration | { status: "error"; message: string }>;
  handleConfigurationExport: (
    configurationId: string,
  ) => Promise<IConfiguration | { status: "error"; message: string }>;
  handleConfigurationImport: (
    formData: FormData,
    config: IConfiguration,
  ) => Promise<IConfiguration | { status: "error"; message: string }>;
}) {
  const { isConnected, emit, listen, resetSocket } = useSocket();
  const [currentConfig, setCurrentConfig] = useState<IConfiguration | null>(
    null,
  );
  const [configurations, setConfigurations] = useState<IConfiguration[]>([]);
  const [errors, setErrors] = useState<string[] | null>([]);

  useEffect(() => {
    if (isConnected) {
      emit("config:get-orchestrator-config");
      listen("config:orchestrator-config", (config) => {
        setCurrentConfig(config);
      });
    }
  }, [emit, listen, isConnected]);

  useEffect(() => {
    if (!isConnected) {
      setCurrentConfig(null);
    }
  }, [isConnected]);

  useEffect(() => {
    setConfigurations(
      allConfigurations.filter((config) => config.id !== currentConfig?.id),
    );
  }, [currentConfig, allConfigurations]);

  function clearError(index: number) {
    setErrors((prevErrors) => {
      const newErrors = prevErrors?.filter((_, i) => i !== index);
      return newErrors || [];
    });
  }

  async function onConfigurationSelection(configurationId: string) {
    try {
      const response = await handleConfigurationSelection(configurationId);
      if (!response) {
        setErrors((prevErrors) => [
          ...(prevErrors || []),
          "Failed to launch configuration.",
        ]);
        return;
      }
      if ("status" in response && response.status === "error") {
        setErrors((prevErrors) => [...(prevErrors || []), response.message]);
        return;
      }
      setErrors(null);
      setCurrentConfig(response as IConfiguration);
      resetSocket();
    } catch (error) {
      console.error(error);
      setErrors((prevErrors) => [
        ...(prevErrors || []),
        "Failed to launch configuration.",
      ]);
    }
  }

  return (
    <div className="mx-auto flex max-w-screen-xl flex-wrap items-stretch gap-4 p-4 pb-4 text-slate-700 xl:p-8">
      {errors && (
        <div className="w-full">
          <div className="mx-auto flex max-w-lg flex-col gap-2">
            {errors.map((error, index) => (
              <Alert
                key={error + index}
                type="error"
                onClose={() => clearError(index)}
              >
                {error}
              </Alert>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 xl:max-w-2xl xl:basis-full">
        <LaunchConfig
          configurations={configurations}
          isConnected={isConnected}
          onConfigurationSelection={onConfigurationSelection}
          onConfigurationExport={handleConfigurationExport}
        />
      </div>
      <div className="flex h-fit w-full flex-col gap-4 md:flex-1 xl:gap-8">
        {currentConfig && (
          <CurrentConfig
            currentConfig={currentConfig}
            onConfigurationExport={handleConfigurationExport}
          />
        )}
        <ImportConfig onConfigurationImport={handleConfigurationImport} />
        <CreateConfig onConfigurationCreation={handleConfigurationImport} />
      </div>
    </div>
  );
}

export default Home;
