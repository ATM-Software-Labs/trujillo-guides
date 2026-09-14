import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ensure-savings-index',
      closeBundle() {
        const outDir = path.resolve(__dirname, 'public/savings');
        const savingsHtml = path.join(outDir, 'savings.html');
        const indexHtml = path.join(outDir, 'index.html');
        if (fs.existsSync(savingsHtml)) {
          fs.copyFileSync(savingsHtml, indexHtml);
          console.log('Copied savings.html to index.html in public/savings');
        }
        const avatarSrc = path.resolve(__dirname, 'public/avatar.png');
        const avatarDst = path.join(outDir, 'avatar.png');
        if (fs.existsSync(avatarSrc)) {
          fs.copyFileSync(avatarSrc, avatarDst);
          console.log('Copied avatar.png to public/savings');
        }
        const faviconSrc = path.resolve(__dirname, 'public/favicon.ico');
        const faviconDst = path.join(outDir, 'favicon.ico');
        if (fs.existsSync(faviconSrc)) {
          fs.copyFileSync(faviconSrc, faviconDst);
          console.log('Copied favicon.ico to public/savings');
        }
      }
    }
  ],
  base: './',
  publicDir: false,
  build: {
    outDir: 'public/savings',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        savings: path.resolve(__dirname, 'savings.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
