import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["cspf/**/*.test.ts"],
  },
});
