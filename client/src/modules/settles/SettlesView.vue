<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { formatMoney } from '@/shared/format';
import { settlesApi } from './api';
import type { Settle } from './types';

const settles = ref<Settle[]>([]);
const loading = ref(true);
const error = ref('');
const newName = ref('');
const editingId = ref<number | null>(null);
const editingName = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    settles.value = await settlesApi.list();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function addSettle() {
  const name = newName.value.trim();
  if (!name) return;
  try {
    await settlesApi.create(name);
    newName.value = '';
    await load();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

function startEdit(s: Settle) {
  editingId.value = s.id;
  editingName.value = s.name;
}

async function saveEdit() {
  if (editingId.value === null) return;
  const name = editingName.value.trim();
  if (!name) return;
  try {
    await settlesApi.rename(editingId.value, name);
    editingId.value = null;
    await load();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

async function toggleClosed(s: Settle) {
  try {
    if (s.closedAt) {
      await settlesApi.reopen(s.id);
    } else {
      await settlesApi.close(s.id);
    }
    await load();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

async function removeSettle(s: Settle) {
  if (
    !window.confirm(
      `Abrechnung „${s.name}“ wirklich löschen? Alle enthaltenen Ausgaben werden gelöscht.`,
    )
  ) {
    return;
  }
  try {
    await settlesApi.remove(s.id);
    await load();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

onMounted(load);
</script>

<template>
  <div class="view">
    <div class="view-header">
      <h1>Abrechnungen</h1>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <form class="add-person" @submit.prevent="addSettle">
      <input
        v-model="newName"
        type="text"
        placeholder="Name der Abrechnung (z. B. September)"
        required
      />
      <button type="submit" class="btn btn-primary">Neue Abrechnung</button>
    </form>

    <p v-if="loading" class="muted">Lade…</p>

    <p v-else-if="settles.length === 0" class="empty">Noch keine Abrechnung vorhanden.</p>

    <ul class="settle-list">
      <li
        v-for="s in settles"
        :key="s.id"
        class="settle-card"
        :class="{ closed: s.closedAt }"
      >
        <div class="settle-main">
          <template v-if="editingId === s.id">
            <input
              v-model="editingName"
              type="text"
              class="person-edit-input"
              @keyup.enter="saveEdit"
            />
          </template>
          <template v-else>
            <div class="settle-title">
              <span class="settle-name">{{ s.name }}</span>
              <span class="badge" :class="s.closedAt ? 'badge-closed' : 'badge-open'">
                {{ s.closedAt ? 'Abgeschlossen' : 'Offen' }}
              </span>
            </div>
            <div class="settle-meta">
              {{ s.expenseCount }} Ausgabe{{ s.expenseCount === 1 ? '' : 'n' }} ·
              {{ formatMoney(s.totalCents) }}
            </div>
          </template>
        </div>

        <div class="settle-actions">
          <template v-if="editingId === s.id">
            <button class="btn btn-primary btn-sm" @click="saveEdit">Speichern</button>
            <button class="btn btn-secondary btn-sm" @click="editingId = null">Abbrechen</button>
          </template>
          <template v-else>
            <button class="btn btn-secondary btn-sm" @click="toggleClosed(s)">
              {{ s.closedAt ? 'Wieder öffnen' : 'Abschließen' }}
            </button>
            <button class="icon-btn" title="Umbenennen" @click="startEdit(s)">✏️</button>
            <button class="icon-btn" title="Löschen" @click="removeSettle(s)">🗑️</button>
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>
