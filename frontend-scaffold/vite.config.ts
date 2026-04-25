/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import { createHash } from "crypto";
import fs from "fs";
import { visualizer } from "rollup-plugin-visualizer";

// Plugin to generate and log SRI hashes for built assets
function sriPlugin() {
  return {
    name: "vite-plugin-sri",
    apply: "build" as const,
    async writeBundle(options: any) {
      const outDir = options.dir || "build";
      const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []): string[] => {
        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
          const fullPath = path.join(dirPath, file);
          if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
          } else {
            arrayOfFiles.push(fullPath);
          }
        });

        return arrayOfFiles;
      };

      const assets = getAllFiles(outDir);

      assets.forEach((filePath: string) => {
        const file = path.relative(outDir, filePath);
        const content = fs.readFileSync(filePath);
        const hash = createHash("sha384").update(content).digest("base64");
        const integrity = `sha384-${hash}`;
        console.log(`SRI for ${file}: ${integrity}`);
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    nodePolyfills({
      include: ["buffer"],
      globals: { Buffer: true },
    }),
    sriPlugin(),
    visualizer({
      filename: "bundle-analysis.html",
      open: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "build",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-stellar': ['@stellar/stellar-sdk', '@creit.tech/stellar-wallets-kit', '@stellar/freighter-api'],
          'vendor-framer': ['framer-motion'],
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    server: {
      deps: {
        inline: [/@csstools/],
      },
    },
  },
});
