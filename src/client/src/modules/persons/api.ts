import { request } from '@/shared/http';
import type { Person } from './types';

export const personsApi = {
  list: () => request<Person[]>('/api/persons'),
  create: (name: string) =>
    request<Person>('/api/persons', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  rename: (id: number, name: string) =>
    request<Person>(`/api/persons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
  remove: (id: number) => request<void>(`/api/persons/${id}`, { method: 'DELETE' }),
};
