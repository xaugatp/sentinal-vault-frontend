import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import https from 'node:https'
import dns from 'node:dns'

// Custom agent to bypass Cisco Umbrella DNS hijacking
const customAgent = new https.Agent({
  lookup: (hostname, options, callback) => {
    if (hostname === 'sentinelvault.onrender.com') {
      const isAll = typeof options === 'object' && options !== null && options.all;
      if (isAll) {
        callback(null, [{ address: '216.24.57.9', family: 4 }]);
      } else {
        callback(null, '216.24.57.9', 4);
      }
    } else {
      dns.lookup(hostname, options, callback);
    }
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://sentinelvault.onrender.com',
        changeOrigin: true,
        agent: customAgent,
        secure: false
      }
    }
  }
})
