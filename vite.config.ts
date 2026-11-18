import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * Some Web3 SDKs embed an older whatwg-fetch / cross-fetch ponyfill that does
 * `F.prototype = window; new F()` and assigns `this.fetch = false`.
 * When the host environment defines `window.fetch` as a getter-only property,
 * that assignment throws `TypeError: Cannot set property fetch of #<Window> which has only a getter`.
 * Rewriting those ponyfill assignments to `Object.defineProperty(this, ...)` defines
 * an own property on the ponyfill instance without invoking Window's setter.
 */
function safeFetchPonyfillPlugin(): Plugin {
  const fetchAssignRe = /\bthis\.fetch\s*=\s*(?:!1|false)\b/g;
  return {
    name: 'safe-fetch-ponyfill',
    transform(code, id) {
      if (!id.includes('node_modules') || !fetchAssignRe.test(code)) {
        return null;
      }
      fetchAssignRe.lastIndex = 0;
      const transformed = code.replace(
        fetchAssignRe,
        'Object.defineProperty(this,"fetch",{value:false,writable:true,configurable:true,enumerable:true})'
      );
      return {
        code: transformed,
        map: null,
      };
    },
  };
}

export default defineConfig(() => {
  const fetchShimPlugin = safeFetchPonyfillPlugin();
  return {
    plugins: [react(), tailwindcss(), fetchShimPlugin],
    optimizeDeps: {
      rolldownOptions: {
        plugins: [fetchShimPlugin],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
