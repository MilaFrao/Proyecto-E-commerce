import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5174,
    proxy: {
      // Mismo origen en desarrollo: /api y /media van directo al backend.
      '/api': { target: 'http://localhost:5080', changeOrigin: true },
      '/media': { target: 'http://localhost:5080', changeOrigin: true },
    },
  },
  preview: {
    port: 5174,
    proxy: {
      '/api': { target: 'http://localhost:5080', changeOrigin: true },
      '/media': { target: 'http://localhost:5080', changeOrigin: true },
    },
  },
})
