"use server";

import { apiClient } from "@app/utils/apiClient";

const BASE_URL = process.env.NODE_BACKEND_URL || "http://localhost:2223";

export async function getAllConfigurations() {
  const url = `${BASE_URL}/configurations`;
  console.log(`Fetching configurations from: ${url}`);
  return apiClient(url); // Use apiClient for fetching
}

export async function registerOrchestratorConnection(data: any) {
  const url = `${BASE_URL}/registerOrchestratorConnection`;
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  console.log(`Registering orchestrator connection with: ${url}`);
  return apiClient(url, options);
}

export async function startOrchestratorConnection(id: string) {
  const url = `${BASE_URL}/startOrchestratorConnection/${id}`;
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  };
  console.log(`Starting orchestrator connection with: ${url}`);
  return apiClient(url, options);
}
