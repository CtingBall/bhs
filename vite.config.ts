import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// base './' 使构建产物可兼容静态托管；
// vite-plugin-singlefile 将 JS/CSS 全部内联进单个 index.html，
// 使其可通过 file:// 双击直接运行（内联脚本不受模块 CORS 限制）。
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: {
    outDir: 'dist',
    target: 'es2022',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    sourcemap: false,
  },
  server: {
    port: 5173,
    host: true,
  },
});
