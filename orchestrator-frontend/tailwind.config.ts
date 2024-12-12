import type { Config } from "tailwindcss";

/** @type {import('tailwindcss').Config} */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        mvn: { primary: "#ff735d", secondary: "#bb3b27", text: "#000000" },
        optitrack: {
          primary: "#d04343",
          secondary: "#ff7f7f",
          text: "#ffffff",
        },
        metaquest: {
          primary: "#ecbdff",
          secondary: "#8500bb",
          text: "#000000",
        },
        base: { primary: "#3f51b5", text: "#ffffff" },
        unreal: { primary: "#63ceff", secondary: "#005a84", text: "#000000" },
        "ultragrid-send": {
          primary: "#ff912c",
          secondary: "#ffc997",
          text: "#000000",
        },
        "ultragrid-receive": {
          primary: "#ff912c",
          secondary: "#ffc997",
          text: "#000000",
        },
        orchestrator: "#3f51b5",
        lab: "#7d5abb",
        primary: "#0d9488",
        secondary: "#152db3",
        tertiary: "#f4f4f5",
      },
    },
  },
  plugins: [],
};
export default config;
