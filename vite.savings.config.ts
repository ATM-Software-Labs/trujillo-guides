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

        // Ensure directory indexes for zero-redirect clean URLs on Cloudflare Pages
        const cleanDirs = [
          { src: 'public/u.html', dst: 'public/u/index.html', dir: 'public/u' },
          { src: 'public/g.html', dst: 'public/g/index.html', dir: 'public/g' },
          { src: 'public/settings.html', dst: 'public/settings/index.html', dir: 'public/settings' }
        ];
        cleanDirs.forEach(({ src, dst, dir }) => {
          const srcPath = path.resolve(__dirname, src);
          const dstPath = path.resolve(__dirname, dst);
          const dirPath = path.resolve(__dirname, dir);
          if (fs.existsSync(srcPath)) {
            if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
            fs.copyFileSync(srcPath, dstPath);
            console.log(`Synchronized ${src} to ${dst}`);
          }
        });
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
