import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/packages/core",
  plugins: [
    dts({
      entryRoot: "src",
      tsconfigPath: resolve(__dirname, "tsconfig.lib.json"),
      outDir: "dist",
    }),
  ],
  test: {
    name: "@base-ripple/core",
    watch: false,
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8" as const,
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es" as const],
      fileName: "index",
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/index.ts"),
        styles: resolve(__dirname, "src/styles.css"),
      },
    },
    cssCodeSplit: true,
    cssMinify: "lightningcss" as const,
  },
}));
