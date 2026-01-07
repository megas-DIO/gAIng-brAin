import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/health": "http://localhost:3000",
      "/status": "http://localhost:3000",
      "/metrics": "http://localhost:3000",
      "/workers": "http://localhost:3000",
      "/roles": "http://localhost:3000",
      "/mcp": "http://localhost:3000"
    }
  }
});
