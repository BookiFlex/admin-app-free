import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BANNER = `/*!
 * BookiFlex Admin Core Library
 * License: GPL-2.0-or-later
 * © 2026 BookiFlex
 */`

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('sl-'),
        }
      }
    })
  ],

  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'BookiFlexAdminCore',
      formats: ['es'],
      fileName: () => 'index.js'
    },

    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: [
        'vue',
        '@wordpress/i18n'
      ],

      output: {
        // Preserve module structure for better tree-shaking
        preserveModules: true,
        preserveModulesRoot: 'src',

        // Ensure proper exports
        exports: 'named',

        globals: {
          vue: 'Vue',
          '@wordpress/i18n': 'wp.i18n'
        },

        banner: BANNER
      }
    },

    // Output directory
    outDir: 'dist',

    // Generate sourcemaps for debugging
    sourcemap: true,

    // Empty outDir before build
    emptyOutDir: true
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})