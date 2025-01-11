"use client";

import {
  ArrowUpTrayIcon,
  CloudArrowUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import Button from "@/components/Button";

function ImportConfig({
  onConfigurationImport,
}: {
  onConfigurationImport: (
    formData: FormData,
    config: IConfiguration,
  ) => Promise<IConfiguration | { status: "error"; message: string }>;
}) {
  const [importedConfig, setImportedConfig] = useState<File | null>(null);
  const configurationImportForm = useRef<HTMLFormElement>(null);

  function onImportFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportedConfig(file);
  }

  function resetImportedConfig(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setImportedConfig(null);
    configurationImportForm.current?.reset();
  }

  async function handleConfigurationImport(formData: FormData) {
    if (!importedConfig) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!reader.result) return;
      try {
        const response = await onConfigurationImport(
          formData,
          JSON.parse(reader.result as string),
        );
        setImportedConfig(null);
        configurationImportForm.current?.reset();
        if ("status" in response && response.status === "error") {
          alert(response.message);
          return;
        }
      } catch (error) {
        console.error(error);
        alert("Failed to import configuration.");
        setImportedConfig(null);
      }
    };
    reader.readAsText(importedConfig);
  }

  return (
    <form
      action={handleConfigurationImport}
      ref={configurationImportForm}
      className="flex flex-1 flex-col gap-2 rounded-md border border-gray-700 bg-white"
    >
      <h3 className="w-full rounded-t-sm bg-orchestrator py-2 text-center text-lg font-bold text-white">
        Upload a configuration file{" "}
      </h3>
      <label
        htmlFor="configurationFile"
        className="flex cursor-pointer flex-col items-center justify-center rounded-md bg-white px-3 py-6"
      >
        {importedConfig ? (
          <div className="flex w-full flex-col items-center justify-center border-gray-700">
            <p className="text-md mb-4 flex items-center gap-2 text-black">
              <span className="font-semibold">{importedConfig.name}</span>
              <button
                className="text-xs text-gray-500"
                type="button"
                onClick={resetImportedConfig}
              >
                <XMarkIcon className="size-6 font-bold" />
              </button>
            </p>
            <Button color="secondary">
              <ArrowUpTrayIcon className="size-4" />
              Import
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <CloudArrowUpIcon className="mb-2 size-6" />
            <p className="mb-2 text-gray-500">
              <span className="font-semibold">Click to upload</span>
            </p>
            <p className="text-xs text-gray-500">JSON file</p>
          </div>
        )}
        <input
          id="configurationFile"
          type="file"
          className="hidden"
          onChange={onImportFileChange}
        />
      </label>
    </form>
  );
}

export default ImportConfig;
