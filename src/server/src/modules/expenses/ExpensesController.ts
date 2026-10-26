import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Query,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { AppError } from '../../shared/http.js';
import type { ErrorResponse } from '../../shared/models.js';
import {
  createExpense,
  deleteExpense,
  importExpenses,
  listExpenses,
  setExpenseSettled,
  updateExpense,
} from './service.js';
import type { Expense, ExpenseImportInput, ExpenseInput, ExpenseSettledInput } from './types.js';
import { parseExpenseInput, parseImportInput } from './validation.js';

@Route('expenses')
@Tags('expenses')
export class ExpensesController extends Controller {
  /** List expenses, optionally filtered by settle. */
  @Get()
  public async list(@Query() settleId?: number): Promise<Expense[]> {
    return listExpenses(settleId);
  }

  /** Import multiple expenses from a bank statement. */
  @Post('import')
  @SuccessResponse('201', 'Created')
  @Response<ErrorResponse>(400, 'Bad Request')
  public async import(@Body() input: ExpenseImportInput): Promise<Expense[]> {
    const parsed = parseImportInput(input);
    if ('error' in parsed) throw new AppError(400, parsed.error);

    try {
      const expenses = importExpenses(parsed);
      this.setStatus(201);
      return expenses;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(400, 'Konnte Ausgaben nicht importieren. Prüfe Personen und Beträge.');
    }
  }

  /** Create an expense. */
  @Post()
  @SuccessResponse('201', 'Created')
  @Response<ErrorResponse>(400, 'Bad Request')
  public async create(@Body() input: ExpenseInput): Promise<Expense> {
    const parsed = parseExpenseInput(input);
    if ('error' in parsed) throw new AppError(400, parsed.error);

    try {
      const expense = createExpense(parsed);
      this.setStatus(201);
      return expense;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(400, 'Konnte Ausgabe nicht speichern. Prüfe Personen und Betrag.');
    }
  }

  /** Update an expense. */
  @Patch('{id}')
  @Response<ErrorResponse>(400, 'Bad Request')
  @Response<ErrorResponse>(404, 'Expense not found')
  public async update(@Path() id: number, @Body() input: ExpenseInput): Promise<Expense> {
    const parsed = parseExpenseInput(input);
    if ('error' in parsed) throw new AppError(400, parsed.error);

    try {
      const expense = updateExpense(id, parsed);
      if (!expense) throw new AppError(404, 'Ausgabe nicht gefunden.');
      return expense;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(400, 'Konnte Ausgabe nicht aktualisieren.');
    }
  }

  /** Delete an expense. */
  @Delete('{id}')
  @SuccessResponse('204', 'No Content')
  @Response<ErrorResponse>(404, 'Expense not found')
  public async remove(@Path() id: number): Promise<void> {
    try {
      deleteExpense(id);
      this.setStatus(204);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(400, 'Konnte Ausgabe nicht löschen.');
    }
  }

  /** Mark an expense as paid or unpaid. */
  @Patch('{id}/settled')
  @Response<ErrorResponse>(404, 'Expense not found')
  public async setSettled(
    @Path() id: number,
    @Body() input: ExpenseSettledInput,
  ): Promise<Expense> {
    try {
      return setExpenseSettled(id, input.settled);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(400, 'Konnte Ausgabe nicht aktualisieren.');
    }
  }
}
