import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['client/src/**/*.test.ts', 'server/tests/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
  },
});
