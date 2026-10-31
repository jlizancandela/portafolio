// @ts-check
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://jorgelizancandela.com',
  integrations: [preact(), sitemap()],
  vite: {
    resolve: {
      // El widget del chat se distribuye como fuente y renderiza Markdown con
      // `react-markdown`, así que necesita que `react` resuelva a `preact/compat`.
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
        'react/jsx-dev-runtime': 'preact/jsx-dev-runtime'
      }
    },
    esbuild: {
      // El paquete llega como TypeScript sin `tsconfig` en el tarball, y Vite no
      // resuelve el `tsconfig` del proyecto para ficheros dentro de `node_modules`.
      // Sin esto, esbuild compila su JSX con el runtime clásico y el bundle pide un
      // `React` global que no existe: la isla falla con "React is not defined".
      jsx: 'automatic',
      jsxImportSource: 'preact'
    }
  }
});
