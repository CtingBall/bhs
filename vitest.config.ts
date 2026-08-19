import { defineConfig } from 'vitest/config';

// Vitest 独立配置：统一 jsdom 环境（localStorage/DOM 可用），
// 同时保持 vite.config.ts 仅负责生产构建。
export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost/' },
    },
    include: ['tests/**/*.test.ts'],
  },
});
