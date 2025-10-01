import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
    hmr: {
      host: "localhost"
    },
    watch: {
      ignored: ["**/jules-scratch/**"]
    }
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
    entries: [
      './src/pages/**/*.tsx',
      './src/components/**/*.tsx',
      './src/contexts/**/*.tsx'
    ]
  }
}));
