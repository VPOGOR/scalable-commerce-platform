import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "catalog",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductCard": "./src/components/ProductCard.tsx",
        "./ProductList": "./src/components/ProductList.tsx",
        "./Header": "./src/components/Header.tsx"
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 3002,
    // CORS headers потрібні в dev: host на :3001 завантажує remoteEntry.js з :3002
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  },
});
