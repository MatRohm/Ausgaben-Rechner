import express, { type Express } from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Resolve the package root so the bundled Swagger UI assets can be served
// without an external CDN.
const swaggerUiDir = path.dirname(require.resolve('swagger-ui-dist'));
const openApiSpecPath = path.resolve(__dirname, '../../../../contracts/openapi.yaml');

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
        url: '/api/openapi.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    </script>
  </body>
</html>
`;

/**
 * Serve the OpenAPI document and Swagger UI at the API root.
 */
export function registerApiDocs(app: Express): void {
  app.use('/api/swagger-ui', express.static(swaggerUiDir, { index: false }));

  app.get('/api/openapi.yaml', (_req, res) => {
    res.sendFile(openApiSpecPath);
  });

  app.get('/api', (_req, res) => {
    res.type('html').send(docsPage);
  });
}
