import { Controller, Get, Path, Response, Route, Tags } from 'tsoa';
import { AppError } from '../../shared/http.js';
import type { ErrorResponse } from '../../shared/models.js';
import { computeSettlement } from './service.js';
import type { SettlementResult } from './types.js';

@Route('settlement')
@Tags('settlement')
export class SettlementController extends Controller {
  /** Compute balances and transfers for a settle. */
  @Get('{settleId}')
  @Response<ErrorResponse>(400, 'Bad Request')
  public async get(@Path() settleId: number): Promise<SettlementResult> {
    if (!Number.isInteger(settleId)) {
      throw new AppError(400, 'Ungültige Abrechnungs-ID.');
    }
    return computeSettlement(settleId);
  }
}
