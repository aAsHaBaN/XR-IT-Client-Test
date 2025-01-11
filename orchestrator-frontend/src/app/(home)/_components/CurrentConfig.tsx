"use client";

import useSocket from "@/hooks/useSocket";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  CloudArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { createAndDownloadFile } from "../utils";

function CurrentConfig({
  currentConfig,
  onConfigurationExport,
}: {
  currentConfig: IConfiguration | null;
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
    <div className="flex flex-1 flex-col items-center gap-2 rounded-md border-4 border-green-500 bg-white pb-6">
      <h3 className="w-full rounded-t-sm bg-green-500/50 py-2 text-center text-lg font-bold">
        {currentConfig?.configuration_name}
      </h3>
      <p className="mb-4 text-center">
        is currently running in the orchestrator.
      </p>
      <div className="flex items-center gap-2 px-12">
        <Button
          color="secondary"
          onClick={() => handleConfigurationExport(currentConfig?.id)}
        >
          <CloudArrowDownIcon className="size-6" />
          Export configuration
        </Button>
        <Link
          href="/overview"
          className="flex items-center gap-2 rounded-md border border-transparent bg-primary px-3 py-1 text-center text-white shadow-md transition-all hover:bg-primary/80 hover:shadow-lg focus:bg-primary/80 focus:shadow-none active:bg-primary/80 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
        >
          <span>Go to overview</span>
          <ArrowUpRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}

export default CurrentConfig;
