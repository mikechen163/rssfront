import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8200',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 设置原始请求头
            proxyReq.setHeader('Origin', req.headers.origin || 'http://192.168.5.203:5173');
            proxyReq.setHeader('Referer', req.headers.referer || 'http://192.168.5.203:5173');
          });
        }
      }
    }
  }
})
