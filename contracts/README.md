# API contract

The REST contract is generated from the tsoa controllers in
`src/server/src/**/*Controller.ts` and their model annotations. Swagger UI is
served at `/api` and loads the generated document from `/api/openapi.json`.

`npm run tsoa` also generates the Express route wiring in
`src/server/src/generated/routes.ts`. That file is checked in so the server can
be built from a clean checkout; regenerate it after changing controllers.

## Generated client types

The client consumes the contract through generated TypeScript types:

```bash
npm run contracts:generate
```

This writes `src/client/src/shared/api-types.ts`. Do not edit that file by hand.
The module `types.ts` files alias the generated `components["schemas"][...]`
entries, so client code keeps readable names while staying tied to the spec.

`npm run contracts:check` regenerates the file in memory and fails when the
committed copy is stale. It runs in `npm run verify` and in CI.

## Contract tests

`src/tests/server/contracts.test.ts`:

1. validates the generated `src/server/dist/openapi.json` with
   `@apidevtools/swagger-parser`;
2. starts the real Express app against a temporary SQLite database;
3. exercises every documented endpoint and validates each successful response
   body with Ajv against the dereferenced OpenAPI schema;
4. validates at least one documented error response.

The server keeps its own internal types (`src/server/src/modules/*/types.ts`) rather
than importing client code. The contract test is what catches drift between the
server's implementation and the published contract.

## Changing the API

1. Update the controller and model annotations.
2. Run `npm run contracts:generate` and commit the generated client types.
3. Run `npm run verify`.
