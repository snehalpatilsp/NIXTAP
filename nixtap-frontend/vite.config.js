import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Fix 14: proxy all /api requests through Vite dev server to avoid CORS issues.
// In dev mode the browser talks to localhost:3000 (Vite).
// Vite forwards /api/** to the Spring Cloud Gateway at localhost:8080.
// In production build, configure CORS on the gateway instead.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
