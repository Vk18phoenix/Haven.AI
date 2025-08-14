import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This new section forces Vite to find and prepare these specific icon packages.
  optimizeDeps: {
    include: ['react-icons/hi', 'react-icons/io5'],
  },
})