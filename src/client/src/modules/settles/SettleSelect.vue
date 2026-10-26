<script setup lang="ts">
import type { Settle } from './types';

defineProps<{
  settles: Settle[];
  modelValue: number | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>();

function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  emit('update:modelValue', value === '' ? null : Number(value));
}
</script>

<template>
  <select class="settle-select" :value="modelValue ?? ''" @change="onChange">
    <option value="" disabled>Abrechnung wählen…</option>
    <option v-for="s in settles" :key="s.id" :value="s.id">
      {{ s.name }}{{ s.closedAt ? ' (abgeschlossen)' : '' }}
    </option>
  </select>
</template>
