import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  envDir: "..",
  server: {
    port: 3000,
    proxy: {
      "/matches": {
        target: backendUrl,
      },
      "/ws": {
        target: backendUrl.replace("http://", "ws://"),
        ws: true,
      },
    },
  },
});
