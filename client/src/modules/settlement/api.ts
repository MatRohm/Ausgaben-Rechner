import { request } from '@/shared/http';
import type { SettlementResult } from './types';

export const settlementApi = {
  get: (settleId: number) => request<SettlementResult>(`/api/settlement/${settleId}`),
};
