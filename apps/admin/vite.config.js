import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      '/api': process.env.VITE_API_URL || 'http://localhost:3001',
      '/health': process.env.VITE_API_URL || 'http://localhost:3001',
    }
  },
  resolve: {
    alias: {
      '@azh/shared-ui': path.resolve(__dirname, '../../packages/shared-ui/src'),
    }
  }
})
