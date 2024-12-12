
"use client";

import React, { useState } from "react";
import Configurations from "../components/Configurations";
import RegistrationForm from "../components/RegistrationForm";

export default function Home() {
  const [configurations, setConfigurations] = useState<any[]>([]); // Centralized configurations state

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-5xl">
        {/* Left Component */}
        <div className="flex-1">
          <Configurations configurations={configurations} setConfigurations={setConfigurations} />
        </div>

        {/* Right Component */}
        <div className="flex-1">
          <RegistrationForm setConfigurations={setConfigurations} />
        </div>
      </div>
    </div>
  );
}