import { Router } from 'express';
import { computeSettlement } from './service.js';

export const settlementRouter = Router();

settlementRouter.get('/:settleId', (req, res) => {
  const settleId = Number(req.params.settleId);
  if (!Number.isInteger(settleId)) {
    res.status(400).json({ error: 'Ungültige Abrechnungs-ID.' });
    return;
  }
  res.json(computeSettlement(settleId));
});
