import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (res && res.writeHead) {
              try {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, offline: true }));
              } catch (_) {}
            }
          });
        },
      },
    },
  },
})
