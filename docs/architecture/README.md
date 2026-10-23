# Architecture

This repository is a modular monolith (modulith): a Vue/TypeScript client and an
Express/TypeScript server, each organized into business modules with explicit
public entry points. The client talks to the server exclusively through the
REST API.

## Module ownership

| Module       | Owns                                                                     | Public entry point            |
| ------------ | ------------------------------------------------------------------------ | ----------------------------- |
| `persons`    | People who can pay for and share expenses                                | `modules/persons/index.ts`    |
| `settles`    | Settlements ("Abrechnungen"), including open/closed lifecycle state      | `modules/settles/index.ts`    |
| `expenses`   | Expenses, payer, participants, weights, paid state, and statement import | `modules/expenses/index.ts`   |
| `settlement` | Balance and transfer calculation for one settle                          | `modules/settlement/index.ts` |

The same four modules exist in `client/src/modules/` and
`server/src/modules/`. Module names and ownership are intentionally aligned,
but the two applications never import each other's code.

### Dependency direction

```text
client/src/app ──────────────► client/src/modules/* (public index only)
client/src/modules/* ────────► client/src/shared
client/src/modules/expenses ─► client/src/modules/persons (public)
client/src/modules/expenses ─► client/src/modules/settles (public)
client/src/modules/settlement ► client/src/modules/expenses (public, type-only)
client/src/modules/settlement ► client/src/modules/settles (public)

server/src/app ──────────────► server/src/modules/* (public index only)
server/src/modules/expenses ─► server/src/modules/settles (public)
server/src/modules/settlement ► server/src/modules/expenses (public)
server/src/modules/settlement ► server/src/modules/persons (public)
server/src/modules/* ────────► server/src/shared
```

Dependencies must stay acyclic. The graph above is the intended direction; the
architecture check rejects new edges between modules unless they go through the
target module's `index.ts`.

## Backend layers

Each backend module follows the same shape where the module needs it:

| File            | Responsibility                                                      |
| --------------- | ------------------------------------------------------------------- |
| `types.ts`      | Domain/contract types, framework-free                               |
| `repository.ts` | SQLite access; the only place in the module that touches the schema |
| `service.ts`    | Application rules, cross-module calls through public module indexes |
| `routes.ts`     | HTTP parsing, status codes, mapping to application services         |
| `index.ts`      | Public API; the only cross-module import target                     |

`routes.ts` must not import `repository.ts`; it calls `service.ts`.
`service.ts` must not import Express. `types.ts` must not import Express or the
database driver. The SQLite connection and schema bootstrap live in
`server/src/shared/database.ts`; module repositories are the only module files
that query their tables.

## Frontend layers

| Path                      | Responsibility                                          |
| ------------------------- | ------------------------------------------------------- |
| `app/`                    | App shell, router, bootstrap; may wire modules together |
| `modules/<name>/index.ts` | Public API of the feature module                        |
| `modules/<name>/api.ts`   | REST client for that feature, using `shared/http.ts`    |
| `modules/<name>/types.ts` | Request/response types owned by that feature            |
| `modules/<name>/*.vue`    | Pages/components private to the feature by default      |
| `shared/http.ts`          | The only fetch wrapper                                  |
| `shared/format.ts`        | Framework-free formatting utilities                     |

Feature-specific stores/composables (`useSettles`) are private unless the module
exports them deliberately. `settles` exports the selected-settle composable
and the settle picker because both are intentional cross-feature capabilities.

## Enforced rules

`npm run arch:check` runs dependency-cruiser twice (client and server) and fails
on:

- circular dependencies;
- any client → server or server → client import;
- cross-module deep imports (only `<module>/index.ts` is a legal target);
- imports from `modules/*` into `app/`;
- `app/` importing module internals instead of public indexes;
- `shared/` importing modules or app code;
- `routes.ts` importing `repository.ts`;
- `service.ts` importing Express;
- `types.ts` importing Express or better-sqlite3.

`npm run contracts:check` recomputes the client types from
`contracts/openapi.yaml` and fails when the committed file is stale.
`server/tests/contracts.test.ts` validates the spec and every documented response
body against it.

The rules are defined in `.dependency-cruiser.cjs` (with per-workspace
TypeScript resolution in `.dependency-cruiser.client.cjs` and
`.dependency-cruiser.server.cjs`); the path patterns are the source of truth, so
documentation cannot drift far from enforcement.

## Conventions (not automated)

These remain review conventions because automating them would add more
complexity than value for this repository:

- Keep feature-specific UI out of `shared/`.
- Prefer a public API function or composable over exporting a whole store.
- Do not expose internal domain entities as REST DTOs by accident; the server
  returns the small, explicit shapes in each module's `types.ts`.
- Keep comments and docs current when module ownership changes.

## Code quality

ESLint (Vue + TypeScript) and Prettier run in `npm run verify` and CI. They cover
code quality and style; module boundaries remain dependency-cruiser's job so the
two checks do not duplicate each other.

## Known coupling and exceptions

- **Shared SQLite schema:** `settles/repository.ts` reads the `expenses` table
  to compute `expenseCount` and `totalCents`. This is a read-only aggregate
  coupling on the physical schema; all writes to `expenses` still go through
  the `expenses` module. Keeping the join here avoids a `settles → expenses`
  dependency, which would create a module cycle. If this grows, extract a
  read model outside both modules.
- **Generated REST types:** the client consumes `contracts/openapi.yaml` through
  generated types in `client/src/shared/api-types.ts`; the module `types.ts`
  files alias the generated schemas. The server keeps its own internal types,
  and `server/tests/contracts.test.ts` validates real responses against the
  published contract. Regenerate with `npm run contracts:generate`; CI fails if
  the committed types are stale.

## REST boundary

The server exposes `/api/persons`, `/api/settles`, `/api/expenses`, and
`/api/settlement`. Their paths and payload shapes live in
`contracts/openapi.yaml`; see `contracts/README.md` for the generation and
contract-test workflow. The client never imports server source; the server's
`index.ts` files export application functions and routers, not DTOs intended for
the client bundle.

## Adding a module

1. Pick a business capability, not a technical layer.
2. Create `client/src/modules/<name>/` and/or `server/src/modules/<name>/`.
3. Add an `index.ts` that exports only what other modules genuinely need.
4. Add the dependency edge to `docs/architecture/README.md` and, if it is a new
   permitted direction, make sure it does not create a cycle.
5. Wire the router (server) and router/pages (client) through `app/`.
6. Run `npm run verify`.

## Running the checks

```bash
npm run typecheck         # vue-tsc + tsc --noEmit
npm run lint              # ESLint for Vue and TypeScript
npm run format:check      # Prettier
npm run contracts:check   # regenerate client types and reject stale output
npm run arch:check        # dependency-cruiser for client and server
npm test                  # unit, integration, and OpenAPI contract tests
npm run build             # production build of both workspaces
npm run verify            # all of the above, in CI order
```
