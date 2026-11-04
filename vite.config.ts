import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

// No GitHub Actions, GITHUB_SHA identifica o commit que gerou o build.
const commit = process.env.GITHUB_SHA ?? 'local';

/**
 * Torna o artefato rastreável: grava dist/version.json e uma <meta name="app-version">
 * no index.html. O smoke test do deploy e o monitoramento leem esses dados para
 * confirmar qual versão está no ar.
 */
function buildInfo(): Plugin {
  return {
    name: 'build-info',
    transformIndexHtml: () => [{ tag: 'meta', attrs: { name: 'app-version', content: version }, injectTo: 'head' }],
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version, commit, builtAt: new Date().toISOString() }, null, 2) + '\n',
      });
    },
  };
}

// BASE_PATH permite publicar em subdiretório (GitHub Pages: /simula-financas/)
// e na raiz (Docker/nginx). O padrão é a raiz.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [react(), buildInfo()],
});
