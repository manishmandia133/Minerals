import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project sites live under /<repo>/, but Vercel serves
  // from the domain root — Vercel sets process.env.VERCEL during builds,
  // so pick the base accordingly. Site URLs:
  //   GH Pages: https://<user>.github.io/Minerals/
  //   Vercel:   https://<project>.vercel.app/
  base: process.env.VERCEL ? '/' : '/Minerals/',
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
