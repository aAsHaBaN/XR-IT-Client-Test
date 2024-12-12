"use client";

import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import Legend from "./Legend";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Header() {
  const [displayLegend, setDisplayLegend] = useState(false);
  const pathname = usePathname();

  function toggleLegend() {
    setDisplayLegend(!displayLegend);
  }

  return (
    <div className="fixed top-0 z-10 flex h-14 w-full items-center justify-between bg-primary px-4 py-2 shadow-lg">
      <Link href="/">
        <h1 className="font-mono text-3xl font-bold text-tertiary">XR-IT</h1>
      </Link>

      <div className="flex items-center gap-6 text-tertiary">
        <Link
          href="/"
          className={`cursor-pointer hover:underline ${
            pathname === "/" ? "font-bold text-secondary" : ""
          }`}
        >
          Home
        </Link>
        <Link
          href="/overview"
          className={`cursor-pointer hover:underline ${
            pathname === "/overview" ? "font-bold text-secondary" : ""
          }`}
        >
          Overview
        </Link>
        <Link
          href="/configuration"
          className={`cursor-pointer hover:underline ${
            pathname === "/configuration" ? "font-bold text-secondary" : ""
          }`}
        >
          Configuration
        </Link>
      </div>
      <button
        className="relative mr-2 rounded text-tertiary"
        onMouseEnter={toggleLegend}
        onMouseLeave={toggleLegend}
        title="Legend"
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
        {displayLegend && (
          <div className="absolute right-6 top-6">
            <Legend />
          </div>
        )}
      </button>
    </div>
  );
}

export default Header;
