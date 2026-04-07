import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url))
  const env = loadEnv(mode, workspaceRoot, '')

  return {
    envDir: workspaceRoot,
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'bundle-analysis.html',
        template: 'treemap',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET ?? 'http://localhost:3001',
          changeOrigin: true,
        },
        '/widget.js': {
          target: env.API_PROXY_TARGET ?? 'http://localhost:3001',
          changeOrigin: true,
        },
        '/health': {
          target: env.API_PROXY_TARGET ?? 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  }
})
