import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BANNER = `/*!
 * BookiFlex Admin (Free Edition)
 * License: GPL-2.0-or-later
 * © 2026 BookiFlex
 *
 * Uses external libraries: Vue.js (MIT), Shoelace (MIT)
 * Uses WordPress-provided libraries: @wordpress/i18n (GPL-2.0-or-later)
 */`

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('sl-'),
        }
      }
    }),
    {
      name: 'css-banner',
      generateBundle(options, bundle) {
        Object.keys(bundle).forEach(fileName => {
          const file = bundle[fileName]
          if (fileName.startsWith('style.') && fileName.endsWith('.css')) {
            file.source = BANNER + '\n' + file.source
          }
        })
      }
    }
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@dialogs': path.resolve(__dirname, './src/dialogs'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@assets': path.resolve(__dirname, './src/assets'),
      // In dev mode, import admin-core directly from src (not dist)
      '@bookiflex/admin-core/turbo': path.resolve(__dirname, '../admin-core/src/turbo.js'),
      '@bookiflex/admin-core': path.resolve(__dirname, '../admin-core/src/index.js')
    }
  },

  build: {
    manifest: true,

    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ['vue', '@wordpress/i18n'],

      input: {
        adminApp: path.resolve(__dirname, './main.js'),
      },

      output: {
        format: 'iife',
        dir: path.resolve(__dirname, 'dist'),
        entryFileNames: 'index.[hash].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.[hash].css'
          }
          return 'assets/[name].[hash][extname]'
        },
        globals: {
          vue: 'Vue',
          '@wordpress/i18n': 'wp.i18n'
        },
        banner: BANNER
      },
    },

    terserOptions: {
      compress: {
        drop_console: ['log', 'debug', 'info'], // удаляем только log, debug, info
        drop_debugger: true, // удаляем debugger statements
      },
      mangle: {
        reserved: ['wp', 'i18n', '__', 'sprintf', '_x', '_n', '_nx']
      },
      format: {
        comments: /^!/
      }
    },

    cssCodeSplit: false,
    target: 'esnext',
    minify: 'terser',

    // Empty outDir before build
    emptyOutDir: true
  },

  server: {
    host: '127.0.0.1',
    port: 5173,
    origin: 'http://127.0.0.1:8888',
    strictPort: true,
    cors: {
      origin: 'http://127.0.0.1:8888',
      credentials: true,
    },
    hmr: {
      host: '127.0.0.1',
    },
    watch: {
      usePolling: true,
    },
  },

  define: {
    'process.env.BOOKIFLEX_EDITION': JSON.stringify('free'),
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': {},
  },
})