import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      css: {
        postcss: {
          plugins: [
            tailwindcss(),
            autoprefixer(),
          ],
        },
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/v1': {
            target: 'http://127.0.0.1:8000',
            changeOrigin: true,
          },
        },
        watch: {
          ignored: ['**/mobile/**', '**/dist/**', '**/.git/**'],
        },
      },
      esbuild: {
        target: 'es2019',
      },
      build: {
        target: 'es2019',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
