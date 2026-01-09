import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  console.log("DEBUG import.meta:", import.meta);
  console.log("DEBUG env from loadEnv:", env);

  return {
    plugins: [vue()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3001",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
      host: true,
    },
  };
});
