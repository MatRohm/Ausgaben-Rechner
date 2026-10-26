import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { AppError } from '../../shared/http.js';
import type { ErrorResponse } from '../../shared/models.js';
import {
  closeSettle,
  createSettle,
  deleteSettle,
  listSettles,
  renameSettle,
  reopenSettle,
} from './service.js';
import type { Settle, SettleNameInput } from './types.js';

@Route('settles')
@Tags('settles')
export class SettlesController extends Controller {
  /**
   * List all settles.
   * @summary List all settles.
   */
  @Get()
  public async list(): Promise<Settle[]> {
    return listSettles();
  }

  /**
   * Create a settle.
   * @summary Create a settle.
   */
  @Post()
  @SuccessResponse('201', 'Created')
  @Response<ErrorResponse>(400, 'Bad Request')
  @Response<ErrorResponse>(409, 'Name already exists')
  public async create(@Body() input: SettleNameInput): Promise<Settle> {
    const name = input.name.trim();
    if (!name) throw new AppError(400, 'Name ist erforderlich.');

    try {
      const settle = createSettle(name);
      this.setStatus(201);
      return settle;
    } catch {
      throw new AppError(409, 'Eine Abrechnung mit diesem Namen existiert bereits.');
    }
  }

  /**
   * Rename a settle.
   * @summary Rename a settle.
   */
  @Patch('{id}')
  @Response<ErrorResponse>(400, 'Bad Request')
  @Response<ErrorResponse>(404, 'Settle not found')
  @Response<ErrorResponse>(409, 'Name already exists')
  public async rename(@Path() id: number, @Body() input: SettleNameInput): Promise<Settle> {
    const name = input.name.trim();
    if (!name) throw new AppError(400, 'Name ist erforderlich.');

    try {
      const settle = renameSettle(id, name);
      if (!settle) throw new AppError(404, 'Abrechnung nicht gefunden.');
      return settle;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(409, 'Eine Abrechnung mit diesem Namen existiert bereits.');
    }
  }

  /**
   * Close a settle.
   * @summary Close a settle.
   */
  @Post('{id}/close')
  @Response<ErrorResponse>(404, 'Settle not found')
  public async close(@Path() id: number): Promise<Settle> {
    const settle = closeSettle(id);
    if (!settle) throw new AppError(404, 'Abrechnung nicht gefunden.');
    return settle;
  }

  /**
   * Reopen a settle.
   * @summary Reopen a settle.
   */
  @Post('{id}/reopen')
  @Response<ErrorResponse>(404, 'Settle not found')
  public async reopen(@Path() id: number): Promise<Settle> {
    const settle = reopenSettle(id);
    if (!settle) throw new AppError(404, 'Abrechnung nicht gefunden.');
    return settle;
  }

  /**
   * Delete a settle and its expenses.
   * @summary Delete a settle and its expenses.
   */
  @Delete('{id}')
  @SuccessResponse('204', 'No Content')
  public async remove(@Path() id: number): Promise<void> {
    deleteSettle(id);
    this.setStatus(204);
  }
}
