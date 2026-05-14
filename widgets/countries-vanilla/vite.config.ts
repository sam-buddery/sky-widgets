import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
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
