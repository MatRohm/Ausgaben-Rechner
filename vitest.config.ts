import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/client/src/**/*.test.ts', 'src/tests/server/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
  },
});
