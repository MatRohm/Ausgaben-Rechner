import { Router } from 'express';
import {
  createPerson,
  deletePerson,
  listPersons,
  renamePerson,
} from '../repository.js';

export const personsRouter = Router();

personsRouter.get('/', (_req, res) => {
  res.json(listPersons());
});

personsRouter.post('/', (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) {
    res.status(400).json({ error: 'Name ist erforderlich.' });
    return;
  }
  try {
    res.status(201).json(createPerson(name));
  } catch {
    res.status(409).json({ error: 'Eine Person mit diesem Namen existiert bereits.' });
  }
});

personsRouter.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) {
    res.status(400).json({ error: 'Name ist erforderlich.' });
    return;
  }
  try {
    const person = renamePerson(id, name);
    if (!person) {
      res.status(404).json({ error: 'Person nicht gefunden.' });
      return;
    }
    res.json(person);
  } catch {
    res.status(409).json({ error: 'Eine Person mit diesem Namen existiert bereits.' });
  }
});

personsRouter.delete('/:id', (req, res) => {
  deletePerson(Number(req.params.id));
  res.status(204).end();
});
