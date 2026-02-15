
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'create-nojekyll',
      closeBundle() {
        const distPath = path.resolve('dist');
        if (fs.existsSync(distPath)) {
          fs.writeFileSync(path.join(distPath, '.nojekyll'), '');
        }
      }
    }
  ],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url))
    }
  },
  define: {
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
