import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 相对路径，打包后能正确加载
  server: {
    port: 3000,
    strictPort: false, // 端口被占用时自动尝试下一个
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
