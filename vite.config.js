// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'     // ⬅️ v4 plugin

export default defineConfig({
  plugins: [react(), tailwind()],            // ⬅️ add here
  build: {
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  },
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet']
  }
})
