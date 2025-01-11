"use client";

import {
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import { createAndDownloadFile } from "../utils";

function LaunchConfig({
  configurations,
  isConnected,
  onConfigurationSelection,
  onConfigurationExport,
}: {
  configurations: IConfiguration[];
  isConnected: boolean;
  onConfigurationSelection: (configurationId: string) => Promise<void>;
  onConfigurationExport: (
    configurationId: string,
  ) => Promise<IConfiguration | { status: "error"; message: string }>;
}) {
  async function handleConfigurationExport(
    configurationId: string | undefined,
  ) {
    if (!configurationId) return;
    try {
      const configuration = await onConfigurationExport(configurationId);
      if ("status" in configuration && configuration.status === "error") {
        alert(configuration.message);
        return;
      }

      createAndDownloadFile(
        (configuration as IConfiguration).configuration_name,
        JSON.stringify(configuration),
      );
    } catch (error) {
      console.error(error);
      alert("Failed to export configuration.");
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-gray-700 bg-white">
      <h3 className="w-full rounded-t-sm bg-orchestrator py-2 text-center text-lg font-bold text-white">
        Launch a configuration
      </h3>
      <div className="flex flex-col items-center gap-4 p-4">
        {isConnected && (
          <div className="relative flex items-center gap-2 rounded-md font-bold text-orange-600">
            <ExclamationTriangleIcon className="size-6" />
            <span>
              Launching a new configuration will kill any existing connections.
            </span>
          </div>
        )}

        <div className="flex w-full max-w-lg flex-col items-center justify-center gap-2">
          {configurations.map((configuration: any) => (
            <div
              key={configuration.id}
              className="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-700 bg-white px-4 py-2"
            >
              <div>
                <h4 className="w-full cursor-pointer font-bold">
                  {configuration.configuration_name}
                </h4>
                <span className="font-mono text-xs">
                  Id: {configuration.id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  color="primary"
                  onClick={() => onConfigurationSelection(configuration.id)}
                >
                  <PlayIcon className="size-4" />
                  Start
                </Button>
                <Button
                  color="secondary"
                  onClick={() => handleConfigurationExport(configuration.id)}
                  square
                >
                  <CloudArrowDownIcon className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LaunchConfig;
