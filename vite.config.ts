import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron'
import { rmSync } from 'node:fs'

rmSync('dist-electron', { recursive: true, force: true })

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    electron([
      {
        entry: 'electron/main.js',
        onstart(args) {
          if (process.env.VSCODE_DEBUG) {
            console.log('[startup] Electron App')
          } else {
            args.startup()
          }
        },
        vite: {
          build: {
            sourcemap: false,
            minify: false,
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'cjs'
              }
            },
          },
        },
      },
      {
        entry: 'electron/preload.js',
        onstart(args) {
          args.reload()
        },
        vite: {
          build: {
            sourcemap: false,
            minify: false,
            outDir: 'dist-electron/preload',
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'cjs'
              }
            },
          },
        },
      },
    ]),
  ],
  server: process.env.VSCODE_DEBUG ? {
    host: 'localhost',
    port: 5173,
  } : undefined,
  clearScreen: false,
})