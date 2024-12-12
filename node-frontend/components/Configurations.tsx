"use client";

import React, { useEffect, useState } from "react";
import { getAllConfigurations, startOrchestratorConnection } from "@app/app/apiActions";

interface ConfigurationsProps {
  configurations?: any[];
  setConfigurations?: (configs: any[]) => void;
}

export default function Configurations({
  configurations = [],
  setConfigurations,
}: ConfigurationsProps) {

  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null); // To handle loading states for individual configurations
  const [successMessage, setSuccessMessage] = useState("");
  const [isDataFetched, setIsDataFetched] = useState(false); // Track if data is fetched

  useEffect(() => {
    async function fetchData() {
      if (!isDataFetched && setConfigurations) {
        try {
          const data = await getAllConfigurations();
          setConfigurations(data);
          setIsDataFetched(true); // Mark data as fetched
        } catch (err: any) {
          setError(err.message);
        }
      }
    }

    fetchData();
  }, [isDataFetched, setConfigurations]);

  const handleStart = async (id: string) => {
    setLoadingId(id); // Set the loading ID to show feedback for the specific button
    setError("");
    setSuccessMessage("");

    try {
      const response = await startOrchestratorConnection(id);
      console.log(`Response: ${JSON.stringify(response)}`)
      // Ensure the response contains a redirect_address
      if (response?.redirect_address) {
        setSuccessMessage(`Configuration with ID: ${id} started successfully!`)
        console.log(`Redirecting to: ${response.redirect_address}`);
        // Redirect the user to the provided URL
        window.location.href = response.redirect_address;
      } else {
        throw new Error("No redirect address provided.");
      }

    } catch (err: any) {
      setError(`Failed to start configuration with ID: ${id}. Error: ${err.message}`);
    } finally {
      setLoadingId(null); // Reset loading state
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Existing Configurations
      </h2>
      {successMessage && (
        <p className="text-green-600 font-medium mb-4">{successMessage}</p>
      )}
      <div className="space-y-4">
        {configurations.map((config: any) => (
          <div
            key={config.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-gray-800 font-medium">{config.name}</p>
              <p className="text-gray-500 text-sm">ID: {config.id}</p>
            </div>
            <button
              onClick={() => handleStart(config.id)}
              className={`px-5 py-2 text-white rounded-lg shadow transition-transform transform hover:scale-105 ${loadingId === config.id
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
                }`}
              disabled={loadingId === config.id}
            >
              {loadingId === config.id ? "Starting..." : "Start"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
