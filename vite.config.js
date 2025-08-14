import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // This is the direct instruction from the error log.
      // It is a simple list of the exact import paths that are failing.
      external: [
        'react-icons/hi',
        'react-icons/io5'
      ]
    }
  }
})