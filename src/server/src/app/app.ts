import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ValidateError } from 'tsoa';
import { RegisterRoutes } from '../generated/routes.js';
import { AppError } from '../shared/http.js';
import { registerApiDocs } from './swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Build the Express application. Kept free of `listen()` so tests can start it
 * on an ephemeral port; `server/src/index.ts` is the runtime composition root.
 */
export function createApp(): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  registerApiDocs(app);
  RegisterRoutes(app);

  // Serve the built client (when present) for production SPA routing.
  const clientDist = path.resolve(__dirname, '../../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        next();
        return;
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    if (error instanceof ValidateError) {
      res.status(400).json({ error: 'Ungültige Anfrage.' });
      return;
    }

    console.error(error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  });

  return app;
}
