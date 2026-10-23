/**
 * Architecture rules for the client/server modulith.
 *
 * The rules are intentionally path based: every module exposes exactly one
 * public entry point (`index.ts`) and everything else inside a module is
 * private. Run with `npm run arch:check`.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'Module and file dependencies must form a DAG.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-frontend-to-backend',
      comment: 'The frontend must not import backend implementation code.',
      severity: 'error',
      from: { path: '^client/' },
      to: { path: '^server/' },
    },
    {
      name: 'no-backend-to-frontend',
      comment: 'The backend must not import frontend implementation code.',
      severity: 'error',
      from: { path: '^server/' },
      to: { path: '^client/' },
    },
    {
      name: 'client-modules-public-api-only',
      comment:
        'Cross-module imports must target the owning module index.ts; same-module imports stay free.',
      severity: 'error',
      from: { path: '^client/src/modules/([^/]+)/.+' },
      to: {
        path: '^client/src/modules/([^/]+)/.+',
        pathNot: [
          '^client/src/modules/$1/.+',
          '^client/src/modules/[^/]+/index\\.ts$',
        ],
      },
    },
    {
      name: 'server-modules-public-api-only',
      comment:
        'Cross-module imports must target the owning module index.ts; same-module imports stay free.',
      severity: 'error',
      from: { path: '^server/src/modules/([^/]+)/.+' },
      to: {
        path: '^server/src/modules/([^/]+)/.+',
        pathNot: [
          '^server/src/modules/$1/.+',
          '^server/src/modules/[^/]+/index\\.ts$',
        ],
      },
    },
    {
      name: 'client-shared-independent',
      comment: 'Shared UI/utilities must not depend on feature modules or app wiring.',
      severity: 'error',
      from: { path: '^client/src/shared/' },
      to: { path: '^client/src/(modules|app)/' },
    },
    {
      name: 'server-shared-independent',
      comment: 'Shared backend utilities must not depend on feature modules or app wiring.',
      severity: 'error',
      from: { path: '^server/src/shared/' },
      to: { path: '^server/src/(modules|app)/' },
    },
    {
      name: 'client-modules-not-to-app',
      comment: 'Feature modules must not depend on application bootstrap/composition code.',
      severity: 'error',
      from: { path: '^client/src/modules/' },
      to: { path: '^client/src/app/' },
    },
    {
      name: 'server-modules-not-to-app',
      comment: 'Feature modules must not depend on application bootstrap/composition code.',
      severity: 'error',
      from: { path: '^server/src/modules/' },
      to: { path: '^server/src/app/' },
    },
    {
      name: 'client-app-public-api-only',
      comment: 'App composition may import modules, but only through their public index.ts.',
      severity: 'error',
      from: { path: '^client/src/app/' },
      to: {
        path: '^client/src/modules/[^/]+/.+',
        pathNot: '^client/src/modules/[^/]+/index\\.ts$',
      },
    },
    {
      name: 'server-app-public-api-only',
      comment: 'App composition may import modules, but only through their public index.ts.',
      severity: 'error',
      from: { path: '^server/src/app/' },
      to: {
        path: '^server/src/modules/[^/]+/.+',
        pathNot: '^server/src/modules/[^/]+/index\\.ts$',
      },
    },
    {
      name: 'server-routes-not-to-repository',
      comment: 'HTTP routes call application services, never repositories directly.',
      severity: 'error',
      from: { path: '^server/src/modules/[^/]+/routes\\.ts$' },
      to: { path: '^server/src/modules/[^/]+/repository\\.ts$' },
    },
    {
      name: 'server-services-not-to-express',
      comment: 'Application services must stay independent of HTTP presentation.',
      severity: 'error',
      from: { path: '^server/src/modules/[^/]+/service\\.ts$' },
      to: { path: '^node_modules/express/' },
    },
    {
      name: 'server-types-free-of-frameworks',
      comment: 'Module contract types must not depend on Express or the database driver.',
      severity: 'error',
      from: { path: '^server/src/modules/[^/]+/types\\.ts$' },
      to: { path: '^node_modules/(express|better-sqlite3)/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    exclude: { path: '(^|/)(dist|node_modules)/' },
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/[^/]+' },
    },
  },
};
