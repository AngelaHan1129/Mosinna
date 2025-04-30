import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VitePluginVueDevTools from 'vite-plugin-vue-devtools'
const path = require('path')

// 👇 加上 dev server 的 proxy 設定
export default defineConfig({
  plugins: [vue() ,VitePluginVueDevTools()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/check': {
        target: 'http://localhost:5000', 
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
