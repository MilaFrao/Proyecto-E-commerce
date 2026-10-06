import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Evita CORS en desarrollo: /api va directo al backend.
      '/api': {
        target: 'http://localhost:5080',
        changeOrigin: true,
      },
      // Fotos de productos que guarda y sirve el back (decisión 014).
      '/media': {
        target: 'http://localhost:5080',
        changeOrigin: true,
      },
    },
  },
})
