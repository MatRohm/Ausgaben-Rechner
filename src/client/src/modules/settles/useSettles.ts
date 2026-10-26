import { computed, ref } from 'vue';
import { settlesApi } from './api';
import type { Settle } from './types';

// Shared state across views so the selected settle stays consistent
// when navigating between "Ausgaben" and "Ausgleich".
const settles = ref<Settle[]>([]);
const loading = ref(false);
const error = ref('');
const selectedId = ref<number | null>(null);

export function useSettles() {
  async function load() {
    loading.value = true;
    error.value = '';
    try {
      settles.value = await settlesApi.list();
      const stillValid =
        selectedId.value != null && settles.value.some((s) => s.id === selectedId.value);
      if (!stillValid) {
        selectedId.value =
          settles.value.find((s) => !s.closedAt)?.id ?? settles.value[0]?.id ?? null;
      }
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  const selected = computed(() => settles.value.find((s) => s.id === selectedId.value) ?? null);

  return { settles, loading, error, selectedId, selected, load };
}
