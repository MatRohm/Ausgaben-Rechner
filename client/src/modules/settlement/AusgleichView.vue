<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { SettleSelect, useSettles } from '@/modules/settles';
import { formatMoney } from '@/shared/format';
import { settlementApi } from './api';
import type { SettlementResult } from './types';

const { settles, selectedId, selected, load: loadSettles } = useSettles();

const result = ref<SettlementResult | null>(null);
const loading = ref(true);
const error = ref('');

const settledTotal = computed(() =>
  result.value ? result.value.settledExpenses.reduce((sum, e) => sum + e.amountCents, 0) : 0,
);

function selectId(v: number | null) {
  selectedId.value = v;
}

async function loadResult() {
  if (selectedId.value == null) {
    result.value = null;
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    result.value = await settlementApi.get(selectedId.value);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

watch(selectedId, loadResult);

onMounted(async () => {
  await loadSettles();
  await loadResult();
});
</script>

<template>
  <div class="view">
    <div class="view-header">
      <h1>Ausgleich</h1>
      <button class="btn btn-secondary" @click="loadResult">Aktualisieren</button>
    </div>

    <div class="toolbar">
      <SettleSelect :settles="settles" :model-value="selectedId" @update:model-value="selectId" />
    </div>

    <p v-if="selected?.closedAt" class="notice">Diese Abrechnung ist abgeschlossen.</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="selectedId == null" class="empty">
      <p>Noch keine Abrechnung vorhanden.</p>
    </div>

    <p v-else-if="loading" class="muted">Lade…</p>

    <template v-else-if="result">
      <section class="section">
        <h2>Kontostände</h2>
        <ul class="balance-list">
          <li v-for="b in result.balances" :key="b.personId" class="balance-row">
            <span class="balance-name">{{ b.name }}</span>
            <span class="balance-detail">
              bezahlt {{ formatMoney(b.paidCents) }} · Anteil {{ formatMoney(b.owedCents) }}
            </span>
            <span class="balance-amount" :class="b.balanceCents >= 0 ? 'positive' : 'negative'">
              {{ formatMoney(b.balanceCents) }}
            </span>
          </li>
        </ul>
      </section>

      <section class="section">
        <h2>Ausgleichszahlungen</h2>
        <p v-if="result.transfers.length === 0" class="empty">Alle sind ausgeglichen. 🎉</p>
        <ul v-else class="transfer-list">
          <li v-for="(t, i) in result.transfers" :key="i" class="transfer-row">
            <span class="transfer-from">{{ t.fromName }}</span>
            <span class="transfer-arrow">→</span>
            <span class="transfer-to">{{ t.toName }}</span>
            <span class="transfer-amount">{{ formatMoney(t.amountCents) }}</span>
          </li>
        </ul>
      </section>

      <section v-if="result.settledExpenses.length" class="section">
        <h2>Bereits beglichen</h2>
        <ul class="settled-list">
          <li v-for="e in result.settledExpenses" :key="e.id" class="settled-row">
            <span class="settled-desc">{{ e.description }}</span>
            <span class="settled-meta">{{ e.paidByName }}</span>
            <span class="settled-amount">{{ formatMoney(e.amountCents) }}</span>
          </li>
        </ul>
        <p class="settled-total">Gesamt beglichen: {{ formatMoney(settledTotal) }}</p>
      </section>
    </template>
  </div>
</template>
