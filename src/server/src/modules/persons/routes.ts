import { Router } from 'express';
import { sendError } from '../../shared/http.js';
import { createPerson, deletePerson, listPersons, renamePerson } from './service.js';

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
  } catch (error) {
    sendError(res, error, 'Eine Person mit diesem Namen existiert bereits.', 409);
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
  } catch (error) {
    sendError(res, error, 'Eine Person mit diesem Namen existiert bereits.', 409);
  }
});

personsRouter.delete('/:id', (req, res) => {
  deletePerson(Number(req.params.id));
  res.status(204).end();
});
