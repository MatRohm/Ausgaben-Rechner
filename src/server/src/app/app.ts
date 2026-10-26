import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expensesRouter } from '../modules/expenses/index.js';
import { personsRouter } from '../modules/persons/index.js';
import { settlementRouter } from '../modules/settlement/index.js';
import { settlesRouter } from '../modules/settles/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Build the Express application. Kept free of `listen()` so tests can start it
 * on an ephemeral port; `server/src/index.ts` is the runtime composition root.
 */
export function createApp(): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/persons', personsRouter);
  app.use('/api/expenses', expensesRouter);
  app.use('/api/settlement', settlementRouter);
  app.use('/api/settles', settlesRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

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

  return app;
}
