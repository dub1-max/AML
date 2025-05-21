import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['lucide-react'],
  },

  // Enable build optimizations
  build: {
    // Use chunks for better code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react'],
          'charts': ['recharts'],
          'pdf': ['jspdf', 'jspdf-autotable', 'html2canvas'],
        }
      }
    },
    // Add source map for production debugging if needed
    sourcemap: true,
    // Enable minification
    minify: 'terser',
    // Configure terser for better compression
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true
      }
    }
  },

  // Improve server performance
  server: {
    hmr: true,
    // Pre-bundle dependencies
    fs: {
      strict: true,
    }
  },

  // Configure public directory
  publicDir: 'public'
});
