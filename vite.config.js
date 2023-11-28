import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handle } from './amplify/functions/reader-api/core.js';

/**
 * Serves the reader API (the same code that runs on AWS Lambda) at /api during
 * `npm run dev` and `npm run preview`, so no AWS account is needed locally.
 */
function readerApiDev() {
  const middleware = async (req, res, next) => {
    if (req.method !== 'GET') return next();
    const url = new URL(req.url, 'http://localhost');
    const out = await handle(url.pathname, Object.fromEntries(url.searchParams));
    res.statusCode = out.status;
    Object.entries(out.headers).forEach(([k, v]) => res.setHeader(k, v));
    res.end(out.body);
    return undefined;
  };
  return {
    name: 'emanga-reader-api',
    configureServer(server) {
      server.middlewares.use('/api', middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api', middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), readerApiDev()],
  server: { port: 3000, open: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  test: { environment: 'node' },
});
