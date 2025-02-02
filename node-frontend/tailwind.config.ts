import type {Config} from "tailwindcss";
/** @type {import('tailwindcss').Config} */
const config: Config  = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config;