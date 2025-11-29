import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  // Base path for GitHub Pages - change 'DevToy' to your repo name
  base: '',
  plugins: [wasm()],
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    exclude: ['@aspect-build/aspect-regex-wasm'],
  },
});
