import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs so the built output in dist/ works from any path
  // (a sub-directory, GitHub Pages, or the local filesystem), not just a domain root.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Clear stale content-hashed bundles on every build so dist/ never accumulates them.
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/recharts/') || id.includes('node_modules/d3-')) {
            return 'vendor-recharts';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
        }
      }
    }
  }
})
