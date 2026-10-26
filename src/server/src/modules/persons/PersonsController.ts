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
import { createPerson, deletePerson, listPersons, renamePerson } from './service.js';
import type { Person, PersonInput } from './types.js';

@Route('persons')
@Tags('persons')
export class PersonsController extends Controller {
  /**
   * List all persons.
   * @summary List all persons.
   */
  @Get()
  public async list(): Promise<Person[]> {
    return listPersons();
  }

  /**
   * Create a person.
   * @summary Create a person.
   */
  @Post()
  @SuccessResponse('201', 'Created')
  @Response<ErrorResponse>(400, 'Bad Request')
  @Response<ErrorResponse>(409, 'Name already exists')
  public async create(@Body() input: PersonInput): Promise<Person> {
    const name = input.name.trim();
    if (!name) throw new AppError(400, 'Name ist erforderlich.');

    try {
      const person = createPerson(name);
      this.setStatus(201);
      return person;
    } catch {
      throw new AppError(409, 'Eine Person mit diesem Namen existiert bereits.');
    }
  }

  /**
   * Rename a person.
   * @summary Rename a person.
   */
  @Patch('{id}')
  @Response<ErrorResponse>(400, 'Bad Request')
  @Response<ErrorResponse>(404, 'Person not found')
  @Response<ErrorResponse>(409, 'Name already exists')
  public async rename(@Path() id: number, @Body() input: PersonInput): Promise<Person> {
    const name = input.name.trim();
    if (!name) throw new AppError(400, 'Name ist erforderlich.');

    try {
      const person = renamePerson(id, name);
      if (!person) throw new AppError(404, 'Person nicht gefunden.');
      return person;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(409, 'Eine Person mit diesem Namen existiert bereits.');
    }
  }

  /**
   * Delete a person and their expenses.
   * @summary Delete a person and their expenses.
   */
  @Delete('{id}')
  @SuccessResponse('204', 'No Content')
  public async remove(@Path() id: number): Promise<void> {
    deletePerson(id);
    this.setStatus(204);
  }
}
