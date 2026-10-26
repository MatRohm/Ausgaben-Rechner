<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Person } from '@/modules/persons';
import { formatCentsForInput, formatMoney, formatMonth, parseEuroToCents } from '@/shared/format';
import { expensesApi } from './api';
import ExpenseIcon from './ExpenseIcon.vue';
import { parseStatementJson, type StatementCandidate } from './importStatement';
import type { Expense, ExpenseImportRow } from './types';

interface PreviewCandidate extends StatementCandidate {
  duplicate: boolean;
  amountInput: string;
}

const props = defineProps<{
  persons: Person[];
  settleId: number;
  existingExpenses: Expense[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'imported'): void;
}>();

const paidById = ref<number | null>(null);
const selectedParticipants = ref<number[]>(props.persons.map((p) => p.id));
const candidates = ref<PreviewCandidate[]>([]);
const selected = ref<Record<number, boolean>>({});
const skippedOtherCurrency = ref(0);
const fileName = ref('');
const error = ref('');
const importError = ref('');
const importing = ref(false);

const selectableCandidates = computed(() =>
  candidates.value.filter((candidate) => candidate.importable && !candidate.duplicate),
);

const selectedCandidates = computed(() =>
  candidates.value.filter((candidate) => selected.value[candidate.id]),
);

const selectedCount = computed(() => selectedCandidates.value.length);

function parsedAmountCents(candidate: PreviewCandidate): number | null {
  return parseEuroToCents(candidate.amountInput);
}

const selectedTotal = computed(() =>
  selectedCandidates.value.reduce((sum, candidate) => sum + (parsedAmountCents(candidate) ?? 0), 0),
);

const allSelected = computed(
  () =>
    selectableCandidates.value.length > 0 &&
    selectableCandidates.value.every((candidate) => selected.value[candidate.id]),
);

function normalize(text: string): string {
  return text.trim().toLocaleLowerCase('de-DE').replace(/\s+/g, ' ');
}

const existingExpenseKeys = computed(
  () =>
    new Set(
      props.existingExpenses.map(
        (expense) => `${expense.date}|${expense.amountCents}|${normalize(expense.description)}`,
      ),
    ),
);

function isDuplicate(candidate: PreviewCandidate): boolean {
  const amountCents = parsedAmountCents(candidate);
  if (!candidate.importable || amountCents == null) return false;
  return existingExpenseKeys.value.has(
    `${candidate.date}|${amountCents}|${normalize(candidate.description)}`,
  );
}

function refreshCandidate(candidate: PreviewCandidate): void {
  candidate.duplicate = isDuplicate(candidate);
}

function rowError(candidate: PreviewCandidate): string | null {
  if (!candidate.importable) return null;
  if (!candidate.description.trim()) return 'Name ist erforderlich.';
  const amountCents = parsedAmountCents(candidate);
  if (amountCents == null || amountCents <= 0) return 'Betrag muss größer als 0 sein.';
  return null;
}

const invalidSelectedRows = computed(() =>
  selectedCandidates.value.filter((candidate) => rowError(candidate) != null),
);

const canImport = computed(
  () =>
    paidById.value != null &&
    selectedParticipants.value.length > 0 &&
    selectedCount.value > 0 &&
    invalidSelectedRows.value.length === 0 &&
    !importing.value,
);

function togglePerson(id: number): void {
  const index = selectedParticipants.value.indexOf(id);
  if (index >= 0) selectedParticipants.value.splice(index, 1);
  else selectedParticipants.value.push(id);
}

function toggleAll(): void {
  const next = !allSelected.value;
  for (const candidate of selectableCandidates.value) {
    selected.value[candidate.id] = next;
  }
}

function toggleCandidate(id: number): void {
  const candidate = candidates.value.find((entry) => entry.id === id);
  if (!candidate?.importable) return;
  selected.value[id] = !selected.value[id];
}

async function handleFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (!file) return;

  error.value = '';
  importError.value = '';
  candidates.value = [];
  selected.value = {};
  skippedOtherCurrency.value = 0;
  fileName.value = file.name;

  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Die Datei ist zu groß (maximal 5 MB).';
    return;
  }

  try {
    const parsed = parseStatementJson(await file.text());
    candidates.value = parsed.candidates.map((candidate) => {
      const preview: PreviewCandidate = {
        ...candidate,
        amountInput: formatCentsForInput(candidate.amountCents),
        duplicate: false,
      };
      preview.duplicate = isDuplicate(preview);
      return preview;
    });
    for (const candidate of candidates.value) {
      selected.value[candidate.id] = candidate.importable && !candidate.duplicate;
    }
    skippedOtherCurrency.value = parsed.skippedOtherCurrency;

    if (candidates.value.length === 0) {
      error.value =
        parsed.skippedOtherCurrency > 0
          ? 'Die Datei enthält keine EUR-Transaktionen.'
          : 'Die Datei enthält keine Transaktionen.';
    }
  } catch (e) {
    error.value = (e as Error).message;
  }
}

async function submit(): Promise<void> {
  if (!canImport.value || paidById.value == null) return;

  const rows: ExpenseImportRow[] = [];
  for (const candidate of selectedCandidates.value) {
    const amountCents = parsedAmountCents(candidate);
    if (amountCents == null) {
      importError.value = 'Bitte prüfe die markierten Beträge.';
      return;
    }
    rows.push({
      description: candidate.description.trim(),
      amountCents,
      date: candidate.date,
    });
  }

  importing.value = true;
  importError.value = '';

  try {
    await expensesApi.import({
      settleId: props.settleId,
      paidById: paidById.value,
      participants: selectedParticipants.value.map((personId) => ({ personId, weight: 1 })),
      expenses: rows,
    });
    emit('imported');
  } catch (e) {
    importError.value = (e as Error).message;
  } finally {
    importing.value = false;
  }
}
</script>

<template>
  <div class="modal-backdrop">
    <form class="modal import-modal" @submit.prevent="submit">
      <div class="modal-heading">
        <h2 class="form-title">Aus Kontoauszug importieren</h2>
        <button
          type="button"
          class="icon-btn modal-close"
          aria-label="Dialog schließen"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <label class="field">
        <span>Bezahlt von</span>
        <select v-model="paidById">
          <option :value="null" disabled>Bitte wählen…</option>
          <option v-for="person in persons" :key="person.id" :value="person.id">
            {{ person.name }}
          </option>
        </select>
      </label>

      <fieldset class="field">
        <legend>Aufteilen auf</legend>
        <div class="participants">
          <label v-for="person in persons" :key="person.id" class="participant-check">
            <input
              type="checkbox"
              :checked="selectedParticipants.includes(person.id)"
              @change="togglePerson(person.id)"
            />
            <span>{{ person.name }}</span>
          </label>
        </div>
        <p class="hint">
          Alle ausgewählten Ausgaben werden zu gleichen Teilen auf diese Personen aufgeteilt.
        </p>
      </fieldset>

      <label class="field">
        <span>Kontoauszug (JSON)</span>
        <input type="file" accept="application/json,.json" @change="handleFile" />
      </label>

      <p v-if="fileName" class="hint">Datei: {{ fileName }}</p>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="skippedOtherCurrency" class="hint">
        {{ skippedOtherCurrency }} Transaktion(en) in anderer Währung übersprungen.
      </p>

      <template v-if="candidates.length">
        <div class="import-summary">
          <label class="participant-check">
            <input type="checkbox" :checked="allSelected" @change="toggleAll" />
            <span>Alle neuen auswählen</span>
          </label>
          <span>{{ selectedCount }} ausgewählt · {{ formatMoney(selectedTotal) }}</span>
        </div>

        <p class="hint">Name und Betrag der importierbaren Zeilen können angepasst werden.</p>

        <ul class="import-list">
          <li
            v-for="candidate in candidates"
            :key="candidate.id"
            class="import-row"
            :class="{ disabled: !candidate.importable }"
          >
            <input
              type="checkbox"
              :checked="!!selected[candidate.id]"
              :disabled="!candidate.importable"
              @change="toggleCandidate(candidate.id)"
            />
            <div class="import-main">
              <div class="import-top">
                <div class="import-description">
                  <ExpenseIcon :description="candidate.description" />
                  <input
                    v-if="candidate.importable"
                    v-model="candidate.description"
                    class="import-description-input"
                    type="text"
                    aria-label="Name der Ausgabe"
                    @input="refreshCandidate(candidate)"
                  />
                  <span v-else class="import-desc">{{ candidate.description }}</span>
                </div>
                <input
                  v-if="candidate.importable"
                  v-model="candidate.amountInput"
                  class="import-amount-input"
                  type="text"
                  inputmode="decimal"
                  aria-label="Betrag"
                  @input="refreshCandidate(candidate)"
                />
                <span v-else class="import-amount">{{ formatMoney(candidate.amountCents) }}</span>
              </div>
              <div class="import-meta">
                <span>{{ formatMonth(candidate.date) }}</span>
                <span v-if="candidate.partnerName">· {{ candidate.partnerName }}</span>
                <span v-if="candidate.reason === 'credit'" class="badge badge-credit">
                  Gutschrift
                </span>
                <span v-else-if="candidate.reason === 'zero'" class="badge badge-credit">
                  Nicht importierbar
                </span>
                <span v-if="candidate.duplicate" class="badge badge-duplicate">
                  Möglicherweise bereits importiert
                </span>
              </div>
              <p v-if="selected[candidate.id] && rowError(candidate)" class="import-row-error">
                {{ rowError(candidate) }}
              </p>
            </div>
          </li>
        </ul>
      </template>

      <p v-if="importError" class="error">{{ importError }}</p>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="emit('close')">Abbrechen</button>
        <button type="submit" class="btn btn-primary" :disabled="!canImport">
          {{ importing ? 'Importiere…' : `${selectedCount} Ausgaben importieren` }}
        </button>
      </div>
    </form>
  </div>
</template>
