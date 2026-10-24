import { test as base } from '@playwright/test';
import { GenericContainer, Wait, type StartedTestContainer } from 'testcontainers';

const imageTag = 'ausgaben-rechner:e2e';
const repoRoot = process.cwd();

interface AppFixture {
  baseUrl: string;
}

export const test = base.extend<Record<never, never>, { app: AppFixture }>({
  app: [
    // Playwright requires the fixture's first parameter to be an object pattern.
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      if (process.env.E2E_BASE_URL) {
        await use({ baseUrl: process.env.E2E_BASE_URL.replace(/\/$/, '') });
        return;
      }

      const image = await GenericContainer.fromDockerfile(repoRoot, 'Dockerfile')
        .withCache(true)
        .build(imageTag, { deleteOnExit: false });

      let container: StartedTestContainer | undefined;
      try {
        container = await image
          .withExposedPorts(3000)
          .withEnvironment({ PORT: '3000', DATA_DIR: '/app/data' })
          .withStartupTimeout(180_000)
          .withWaitStrategy(Wait.forHttp('/api/health', 3000))
          .start();

        await use({
          baseUrl: `http://${container.getHost()}:${container.getMappedPort(3000)}`,
        });
      } finally {
        await container?.stop();
      }
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
