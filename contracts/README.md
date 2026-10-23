# API contract

`contracts/openapi.yaml` is the source of truth for the REST API shared by the
Vue client and the Express server.

## Generated client types

The client consumes the contract through generated TypeScript types:

```bash
npm run contracts:generate
```

This writes `client/src/shared/api-types.ts`. Do not edit that file by hand.
The module `types.ts` files alias the generated `components["schemas"][...]`
entries, so client code keeps readable names while staying tied to the spec.

`npm run contracts:check` regenerates the file in memory and fails when the
committed copy is stale. It runs in `npm run verify` and in CI.

## Contract tests

`server/tests/contracts.test.ts`:

1. validates `contracts/openapi.yaml` with `@apidevtools/swagger-parser`;
2. starts the real Express app against a temporary SQLite database;
3. exercises every documented endpoint and validates each successful response
   body with Ajv against the dereferenced OpenAPI schema;
4. validates at least one documented error response.

The server keeps its own internal types (`server/src/modules/*/types.ts`) rather
than importing client code. The contract test is what catches drift between the
server's implementation and the published contract.

## Changing the API

1. Update `contracts/openapi.yaml`.
2. Run `npm run contracts:generate` and commit the generated file.
3. Update the server and client implementation as needed.
4. Run `npm run verify`.
