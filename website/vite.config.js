import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// TODO(Kaustubh): set VITE_SITE_URL (e.g. in website/.env.production) to the deployed URL,
// such as https://<user>.github.io/<repo>. Until then social cards point at this placeholder.
const FALLBACK_SITE_URL = 'https://example.com';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const site = (env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, '');

  return {
    // Relative URLs so the build works from any sub-path (e.g. GitHub Pages /My-portfolio/)
    base: './',
    plugins: [
      react(),
      // og:image / twitter:image must be absolute, so index.html carries __SITE_URL__ placeholders
      { name: 'site-url', transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', site) },
    ],
    // public/assets holds the artwork; keep Vite's hashed bundles in their own folder
    build: { assetsDir: 'static' },
    server: { port: 5173 },
  };
});
