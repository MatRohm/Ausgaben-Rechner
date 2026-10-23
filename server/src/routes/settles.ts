import { Router } from 'express';
import {
  closeSettle,
  createSettle,
  deleteSettle,
  listSettles,
  renameSettle,
  reopenSettle,
} from '../repository.js';

export const settlesRouter = Router();

settlesRouter.get('/', (_req, res) => {
  res.json(listSettles());
});

settlesRouter.post('/', (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) {
    res.status(400).json({ error: 'Name ist erforderlich.' });
    return;
  }
  try {
    res.status(201).json(createSettle(name));
  } catch {
    res.status(409).json({ error: 'Eine Abrechnung mit diesem Namen existiert bereits.' });
  }
});

settlesRouter.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) {
    res.status(400).json({ error: 'Name ist erforderlich.' });
    return;
  }
  try {
    const settle = renameSettle(id, name);
    if (!settle) {
      res.status(404).json({ error: 'Abrechnung nicht gefunden.' });
      return;
    }
    res.json(settle);
  } catch {
    res.status(409).json({ error: 'Eine Abrechnung mit diesem Namen existiert bereits.' });
  }
});

settlesRouter.post('/:id/close', (req, res) => {
  const settle = closeSettle(Number(req.params.id));
  if (!settle) {
    res.status(404).json({ error: 'Abrechnung nicht gefunden.' });
    return;
  }
  res.json(settle);
});

settlesRouter.post('/:id/reopen', (req, res) => {
  const settle = reopenSettle(Number(req.params.id));
  if (!settle) {
    res.status(404).json({ error: 'Abrechnung nicht gefunden.' });
    return;
  }
  res.json(settle);
});

settlesRouter.delete('/:id', (req, res) => {
  deleteSettle(Number(req.params.id));
  res.status(204).end();
});
