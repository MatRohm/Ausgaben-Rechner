<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { Person } from '@/modules/persons';
import { personsApi } from '@/modules/persons';
import { SettleSelect, useSettles } from '@/modules/settles';
import { formatMonth, formatMoney } from '@/shared/format';
import { expensesApi } from './api';
import ExpenseIcon from './ExpenseIcon.vue';
import ImportExpensesDialog from './ImportExpensesDialog.vue';
import type { Expense, ExpenseDraft } from './types';
import ExpenseForm from './ExpenseForm.vue';

const { settles, selectedId, selected, load: loadSettles } = useSettles();

const persons = ref<Person[]>([]);
const expenses = ref<Expense[]>([]);
const loading = ref(true);
const error = ref('');
const showForm = ref(false);
const showImport = ref(false);
const editing = ref<Expense | null>(null);
const resetKey = ref(0);
const saveError = ref('');

const selectedClosed = computed(() => !!selected.value?.closedAt);
const canImport = computed(
  () => selectedId.value != null && !selectedClosed.value && persons.value.length > 0,
);

async function loadExpenses() {
  if (selectedId.value == null) {
    expenses.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    expenses.value = await expensesApi.list(selectedId.value);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function loadPersons() {
  try {
    persons.value = await personsApi.list();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

function selectId(v: number | null) {
  selectedId.value = v;
}

watch(selectedId, loadExpenses);
watch(selectedId, () => {
  showImport.value = false;
});

onMounted(async () => {
  await Promise.all([loadSettles(), loadPersons()]);
  await loadExpenses();
});

function openNew() {
  editing.value = null;
  saveError.value = '';
  showForm.value = true;
}

function openEdit(expense: Expense) {
  editing.value = expense;
  saveError.value = '';
  showForm.value = true;
}

async function saveExpense(input: ExpenseDraft): Promise<boolean> {
  if (selectedId.value == null) {
    saveError.value = 'Keine Abrechnung ausgewählt.';
    return false;
  }
  saveError.value = '';
  try {
    const payload = { ...input, settleId: selectedId.value };
    if (editing.value) {
      await expensesApi.update(editing.value.id, payload);
    } else {
      await expensesApi.create(payload);
    }
    await loadExpenses();
    await loadSettles();
    return true;
  } catch (e) {
    saveError.value = (e as Error).message;
    return false;
  }
}

async function handleSubmit(input: ExpenseDraft) {
  const ok = await saveExpense(input);
  if (ok) {
    showForm.value = false;
    editing.value = null;
  }
}

async function handleSubmitNew(input: ExpenseDraft) {
  const ok = await saveExpense(input);
  if (ok) resetKey.value += 1;
}

async function handleDelete(expense: Expense) {
  if (!window.confirm(`„${expense.description}“ wirklich löschen?`)) return;
  try {
    await expensesApi.remove(expense.id);
    await loadExpenses();
    await loadSettles();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

async function toggleSettled(expense: Expense) {
  try {
    await expensesApi.setSettled(expense.id, !expense.settled);
    await loadExpenses();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

function participantsLabel(expense: Expense): string {
  return expense.participants.map((p) => p.name ?? '').join(', ');
}

async function handleImported() {
  showImport.value = false;
  await Promise.all([loadExpenses(), loadSettles()]);
}
</script>

<template>
  <div class="view">
    <div class="view-header">
      <h1>Ausgaben</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" :disabled="!canImport" @click="showImport = true">
          Aus Kontoauszug importieren
        </button>
        <button
          class="btn btn-primary"
          :disabled="selectedId == null || selectedClosed"
          @click="openNew"
        >
          + Neue Ausgabe
        </button>
      </div>
    </div>

    <div class="toolbar">
      <SettleSelect :settles="settles" :model-value="selectedId" @update:model-value="selectId" />
    </div>

    <p v-if="selectedClosed" class="notice">
      Diese Abrechnung ist abgeschlossen (schreibgeschützt).
    </p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="selectedId == null" class="empty">
      <p>Noch keine Abrechnung vorhanden.</p>
      <p>Erstelle zuerst unter „Abrechnungen“ eine Abrechnung.</p>
    </div>

    <p v-else-if="loading" class="muted">Lade…</p>

    <div v-else-if="expenses.length === 0" class="empty">
      <p>Noch keine Ausgaben in dieser Abrechnung.</p>
    </div>

    <ul v-else class="expense-list">
      <li v-for="e in expenses" :key="e.id" class="expense-card" :class="{ settled: e.settled }">
        <div class="expense-main">
          <div class="expense-top">
            <span class="expense-desc">
              <ExpenseIcon :description="e.description" />
              {{ e.description }}
            </span>
            <span class="expense-amount">{{ formatMoney(e.amountCents) }}</span>
          </div>
          <div class="expense-meta">
            <span>{{ e.paidByName }} hat bezahlt</span>
            <span>·</span>
            <span>{{ formatMonth(e.date) }}</span>
            <span v-if="e.settled" class="badge badge-paid">Bezahlt</span>
          </div>
          <div class="expense-split">Aufgeteilt auf: {{ participantsLabel(e) }}</div>
        </div>
        <div class="expense-actions">
          <button
            v-if="!selectedClosed"
            class="btn btn-sm settled-toggle"
            :class="{ active: e.settled }"
            :title="e.settled ? 'Als nicht bezahlt markieren' : 'Als bezahlt markieren'"
            @click="toggleSettled(e)"
          >
            <span v-if="e.settled">✓&nbsp;</span>Bezahlt
          </button>
          <template v-if="!selectedClosed">
            <button class="icon-btn" title="Bearbeiten" @click="openEdit(e)">✏️</button>
            <button class="icon-btn" title="Löschen" @click="handleDelete(e)">🗑️</button>
          </template>
        </div>
      </li>
    </ul>

    <div v-if="showForm" class="modal-backdrop">
      <div class="modal">
        <ExpenseForm
          :persons="persons"
          :expense="editing"
          :reset-key="resetKey"
          :save-error="saveError"
          @submit="handleSubmit"
          @submit-new="handleSubmitNew"
          @cancel="showForm = false"
        />
      </div>
    </div>

    <ImportExpensesDialog
      v-if="showImport && selectedId != null"
      :persons="persons"
      :settle-id="selectedId"
      :existing-expenses="expenses"
      @close="showImport = false"
      @imported="handleImported"
    />
  </div>
</template>
