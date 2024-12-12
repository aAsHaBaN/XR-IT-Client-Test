import { Config } from "tailwindcss/types/config";

export interface TailwindColors {
  primary: string;
  secondary: string;
  [key: string]: any;
}

export interface TailwindTheme {
  colors: {
    mvn: TailwindColors;
    unreal: TailwindColors;
    optitrack: TailwindColors;
    metaquest: TailwindColors;
    "ultragrid-send": TailwindColors;
    "ultragrid-receive": TailwindColors;
    base: TailwindColors;
    orchestrator: string;
    lab: string;
    primary: string;
    secondary: string;
    tertiary: string;
  };
  [key: string]: any;
}

export interface TailwindConfig extends Config {
  theme: TailwindTheme;
}
