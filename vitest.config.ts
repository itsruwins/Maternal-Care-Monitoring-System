import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for the core rules (Phase 9): plain functions only, no database,
// no browser. Run with `npm test`.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
