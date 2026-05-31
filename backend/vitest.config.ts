import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['dist', 'node_modules'],
    env: {
      DATABASE_URL: process.env.DATABASE_URL,
    },
  },
});
