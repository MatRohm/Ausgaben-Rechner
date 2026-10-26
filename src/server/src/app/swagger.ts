import express, { type Express } from 'express';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Resolve the package root so the bundled Swagger UI assets can be served
// without an external CDN.
const swaggerUiDir = path.dirname(require.resolve('swagger-ui-dist'));

// tsoa writes the generated document to the server's dist directory. Resolve
// both layouts so the same code works from source (tsx/vitest) and dist.
const openApiSpecCandidates = [
  path.resolve(__dirname, '../openapi.json'),
  path.resolve(__dirname, '../../dist/openapi.json'),
];
const openApiSpecPath =
  openApiSpecCandidates.find((candidate) => fs.existsSync(candidate)) ?? openApiSpecCandidates[1];

const docsPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ausgaben-Rechner API</title>
    <link rel="stylesheet" href="/api/swagger-ui/swagger-ui.css" />
    <style>
      html {
        box-sizing: border-box;
        overflow-y: scroll;
      }
      *,
      *::before,
      *::after {
        box-sizing: inherit;
      }
      body {
        margin: 0;
        background: #fafafa;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/api/swagger-ui/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    </script>
  </body>
</html>
`;

/**
 * Serve the generated OpenAPI document and Swagger UI at the API root.
 */
export function registerApiDocs(app: Express): void {
  app.use('/api/swagger-ui', express.static(swaggerUiDir, { index: false }));

  app.get('/api/openapi.json', (_req, res) => {
    res.sendFile(openApiSpecPath);
  });

  app.get('/api', (_req, res) => {
    res.type('html').send(docsPage);
  });
}
