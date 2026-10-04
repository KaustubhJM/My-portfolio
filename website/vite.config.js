import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative URLs so the build works from any sub-path (e.g. GitHub Pages /My-portfolio/)
  base: './',
  plugins: [react()],
  // public/assets holds the artwork; keep Vite's hashed bundles in their own folder
  build: { assetsDir: 'static' },
  server: { port: 5173 },
});
