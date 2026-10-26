import { request } from '@/shared/http';
import type { Settle } from './types';

export const settlesApi = {
  list: () => request<Settle[]>('/api/settles'),
  create: (name: string) =>
    request<Settle>('/api/settles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  rename: (id: number, name: string) =>
    request<Settle>(`/api/settles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
  close: (id: number) => request<Settle>(`/api/settles/${id}/close`, { method: 'POST' }),
  reopen: (id: number) => request<Settle>(`/api/settles/${id}/reopen`, { method: 'POST' }),
  remove: (id: number) => request<void>(`/api/settles/${id}`, { method: 'DELETE' }),
};
