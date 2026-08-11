import type { Config } from "tailwindcss";

const config: Config = {
  // Cuando se instale `@traxion-global/design-system`, añadir aquí su preset:
  // presets: [require("@traxion-global/design-system/tailwind-preset")],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // El DS emite clases sin prefijo desde su dist; hay que escanearlo para
    // que Tailwind genere esas utilidades.
    "./node_modules/@traxion-global/design-system/dist/**/*.{js,mjs,cjs}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
