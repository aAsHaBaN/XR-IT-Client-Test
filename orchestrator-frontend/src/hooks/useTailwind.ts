import { useMemo } from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";
import type { TailwindConfig } from "@/../tailwind-config";

export default function useTailwind() {
  const tailwind = useMemo(
    () => resolveConfig<TailwindConfig>(tailwindConfig as TailwindConfig),
    [],
  );

  return tailwind;
}
