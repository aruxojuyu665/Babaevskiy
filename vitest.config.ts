import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["node_modules", ".next", "tests/e2e/**", "tests/visual/**", "tests/motion/**", "tests/perf/**", "tests/layout/**", "tests/text/**", "tests/a11y/**", "tests/regression/**", "tests/throttle/**"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
