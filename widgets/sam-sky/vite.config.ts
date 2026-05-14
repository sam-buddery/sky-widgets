import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  server: {
    cors: true,
  },
  define: command === "build" ? { "process.env.NODE_ENV": JSON.stringify("production") } : {},
  build: {
    lib: {
      entry: "src/main.ts",
      formats: ["es"],
      fileName: "widget",
    },
  },
}));
