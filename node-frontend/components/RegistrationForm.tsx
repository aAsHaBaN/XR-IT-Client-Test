"use client";

import React, { useState } from "react";
import { registerOrchestratorConnection } from "@app/app/apiActions"

interface RegistrationFormProps {
  setConfigurations: (configs: any[]) => void;
}

export default function RegistrationForm({ setConfigurations }: RegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const data = {
        username: formData.get("username"),
        password: formData.get("password"),
        machine_alias: formData.get("machine_alias"),
        orchestrator_ip: formData.get("orchestrator_ip"),
        service_ids: formData.getAll("service_ids"),
        name: formData.get("configuration_name")
      };
      console.log(data);

      const updatedConfigurations = await registerOrchestratorConnection(data);
      setConfigurations(updatedConfigurations);
      setSuccess("Orchestrator connection registered successfully!");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Register client
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            required
            className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            required
            className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="machine_alias" className="block text-sm font-medium text-gray-700">
            Machine Name
          </label>
          <input
            type="text"
            id="machine_alias"
            name="machine_alias"
            placeholder="Enter your machine name"
            required
            className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="orchestrator_ip" className="block text-sm font-medium text-gray-700">
            Server's IP Address
          </label>
          <input
            type="text"
            id="orchestrator_ip"
            name="orchestrator_ip"
            placeholder="Enter the ip of the server"
            required
            className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Select service_ids</label>
          <div className="mt-3 space-y-3">
            {["UNREAL_ENGINE", "MVN", "OPTITRACK"].map((service_ids) => ( // "Unreal Engine", "Xsens MVN", "OptiTrack"
              <div key={service_ids} className="flex items-center">
                <input
                  type="checkbox"
                  id={service_ids}
                  name="service_ids"
                  value={service_ids}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={service_ids} className="ml-3 text-sm text-gray-800">
                  {service_ids}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="machine_alias" className="block text-sm font-medium text-gray-700">
            Configuration name
          </label>
          <input
            type="text"
            id="configuration_name"
            name="configuration_name"
            placeholder="Enter your configuration name"
            required
            className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow hover:shadow-lg transition-transform transform hover:scale-105"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
