import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'redirect-root-to-index',
      configureServer(server) {
        // Redirect root to /index.html
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '') {
            res.writeHead(301, { Location: '/index.html' });
            res.end();
          } else if (req.url === '/kycbox/index.html') {
            res.writeHead(301, { Location: '/index.html' });
            res.end();
          } else {
            next();
          }
        });
      }
    }
  ],
  
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
    // Use esbuild for minification instead of terser
    minify: 'esbuild',
    // Configure esbuild minify options
    target: 'es2015',
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
