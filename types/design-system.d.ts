// El preset de Tailwind del DS se distribuye como CJS sin tipos.
declare module "@traxion-global/design-system/tailwind-preset" {
  import type { Config } from "tailwindcss";
  const preset: Partial<Config>;
  export default preset;
}
