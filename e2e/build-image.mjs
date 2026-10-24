import { fileURLToPath } from 'node:url';
import { GenericContainer } from 'testcontainers';

const imageTag = process.env.E2E_IMAGE ?? 'ausgaben-rechner:e2e';
const repoRoot = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');

if (process.env.E2E_BASE_URL) {
  console.log('E2E_BASE_URL is set; skipping Docker image build.');
  process.exit(0);
}

console.log(`Building ${imageTag} from ${repoRoot}/Dockerfile...`);
await GenericContainer.fromDockerfile(repoRoot, 'Dockerfile')
  .withCache(true)
  .build(imageTag, { deleteOnExit: false });
console.log(`Built ${imageTag}.`);
