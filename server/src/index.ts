import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { personsRouter } from './routes/persons.js';
import { expensesRouter } from './routes/expenses.js';
import { settlementRouter } from './routes/settlement.js';
import { settlesRouter } from './routes/settles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = Number(process.env.PORT ?? 3000);

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
const clientDist = path.resolve(__dirname, '../../client/dist');
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

app.listen(port, () => {
  console.log(`Ausgaben-Rechner läuft auf http://localhost:${port}`);
});
