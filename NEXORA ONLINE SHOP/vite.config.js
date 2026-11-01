import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/dummyjson': {
        target: 'https://dummyjson.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/dummyjson/, ''),
      },
      '/cdn-images': {
        target: 'https://cdn.dummyjson.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cdn-images/, ''),
      },
    },
  },
})
