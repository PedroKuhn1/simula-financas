import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

// BASE_PATH permite publicar em subdiretório (GitHub Pages: /simula-financas/)
// e na raiz (Docker/nginx). O padrão é a raiz.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [react()],
});
