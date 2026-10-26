import { Controller, Get, Route, Tags } from 'tsoa';
import type { Health } from '../shared/models.js';

@Route('health')
@Tags('system')
export class SystemController extends Controller {
  /** Liveness check. */
  @Get()
  public async getHealth(): Promise<Health> {
    return { ok: true };
  }
}
