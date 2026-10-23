<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Person } from '@/modules/persons';
import { todayISO } from '@/shared/format';
import type { Expense, ExpenseDraft } from './types';

const props = defineProps<{
  persons: Person[];
  expense?: Expense | null;
  resetKey?: number;
  saveError?: string;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: ExpenseDraft): void;
  (e: 'submitNew', payload: ExpenseDraft): void;
  (e: 'cancel'): void;
}>();

const description = ref('');
const amountEuro = ref('');
const paidById = ref<number | null>(null);
const date = ref(todayISO());
const selected = ref<number[]>([]);
const weights = ref<Record<number, number>>({});
const formError = ref('');

const amountCents = computed(() => {
  const v = amountEuro.value.replace(',', '.');
  const n = parseFloat(v);
  if (Number.isNaN(n) || n <= 0) return 0;
  return Math.round(n * 100);
});

// Reset for a brand-new entry. By default all persons are pre-selected,
// and the payer/date are kept when continuing with "Speichern und neu".
function resetForNew(keepPayer: boolean) {
  description.value = '';
  amountEuro.value = '';
  if (!keepPayer) paidById.value = null;
  selected.value = props.persons.map((p) => p.id);
  weights.value = {};
  for (const p of props.persons) weights.value[p.id] = 1;
  formError.value = '';
}

function reset() {
  const exp = props.expense;
  if (exp) {
    description.value = exp.description;
    amountEuro.value = (exp.amountCents / 100).toString().replace('.', ',');
    paidById.value = exp.paidById;
    date.value = exp.date;
    selected.value = exp.participants.map((p) => p.personId);
    weights.value = {};
    for (const p of exp.participants) weights.value[p.personId] = p.weight;
    formError.value = '';
  } else {
    resetForNew(false);
  }
}

watch(() => props.expense, reset, { immediate: true });

// After a successful "Speichern und neu" the parent bumps resetKey
// so the form resets while keeping the payer.
watch(
  () => props.resetKey,
  (key) => {
    if (key) resetForNew(true);
  },
);

function togglePerson(id: number) {
  const idx = selected.value.indexOf(id);
  if (idx >= 0) {
    selected.value.splice(idx, 1);
    delete weights.value[id];
  } else {
    selected.value.push(id);
    weights.value[id] = 1;
  }
}

function buildPayload(): ExpenseDraft | null {
  if (!description.value.trim()) {
    formError.value = 'Bitte eine Beschreibung eingeben.';
    return null;
  }
  if (amountCents.value <= 0) {
    formError.value = 'Bitte einen gültigen Betrag eingeben.';
    return null;
  }
  if (!paidById.value) {
    formError.value = 'Bitte auswählen, wer bezahlt hat.';
    return null;
  }
  if (selected.value.length === 0) {
    formError.value = 'Bitte mindestens eine Person auswählen.';
    return null;
  }
  formError.value = '';
  return {
    description: description.value.trim(),
    amountCents: amountCents.value,
    paidById: paidById.value,
    date: date.value,
    participants: selected.value.map((id) => ({
      personId: id,
      weight: weights.value[id] ?? 1,
    })),
  };
}

function submit() {
  const payload = buildPayload();
  if (!payload) return;
  emit('submit', payload);
}

function submitNew() {
  const payload = buildPayload();
  if (!payload) return;
  emit('submitNew', payload);
}
</script>

<template>
  <form class="expense-form" @submit.prevent="submit">
    <h2 class="form-title">{{ expense ? 'Ausgabe bearbeiten' : 'Neue Ausgabe' }}</h2>

    <label class="field">
      <span>Beschreibung</span>
      <input v-model="description" type="text" placeholder="z. B. Einkauf, Restaurant, Miete" />
    </label>

    <label class="field">
      <span>Betrag (€)</span>
      <input v-model="amountEuro" type="text" inputmode="decimal" placeholder="0,00" />
    </label>

    <label class="field">
      <span>Bezahlt von</span>
      <select v-model="paidById">
        <option :value="null" disabled>Bitte wählen…</option>
        <option v-for="p in persons" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </label>

    <label class="field">
      <span>Datum</span>
      <input v-model="date" type="date" />
    </label>

    <fieldset class="field">
      <legend>Aufteilen auf</legend>
      <div class="participants">
        <div v-for="p in persons" :key="p.id" class="participant-row">
          <label class="participant-check">
            <input
              type="checkbox"
              :checked="selected.includes(p.id)"
              @change="togglePerson(p.id)"
            />
            <span>{{ p.name }}</span>
          </label>
          <input
            v-if="selected.includes(p.id)"
            v-model.number="weights[p.id]"
            class="weight-input"
            type="number"
            min="1"
            step="1"
            title="Anteil (Gewicht)"
          />
        </div>
      </div>
      <p class="hint">Gewicht: höhere Zahl = größerer Anteil (Standard: 1 für alle).</p>
    </fieldset>

    <p v-if="formError" class="error">{{ formError }}</p>
    <p v-if="saveError" class="error">{{ saveError }}</p>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="emit('cancel')">Abbrechen</button>
      <template v-if="expense">
        <button type="submit" class="btn btn-primary">Speichern</button>
      </template>
      <template v-else>
        <button type="submit" class="btn btn-secondary">Speichern</button>
        <button type="button" class="btn btn-primary" @click="submitNew">Speichern und neu</button>
      </template>
    </div>
  </form>
</template>
