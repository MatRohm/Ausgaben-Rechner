<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { personsApi } from './api';
import type { Person } from './types';

const persons = ref<Person[]>([]);
const loading = ref(true);
const error = ref('');
const newName = ref('');
const editingId = ref<number | null>(null);
const editingName = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    persons.value = await personsApi.list();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function addPerson() {
  const name = newName.value.trim();
  if (!name) return;
  try {
    await personsApi.create(name);
    newName.value = '';
    await load();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

function startEdit(p: Person) {
  editingId.value = p.id;
  editingName.value = p.name;
}

async function saveEdit() {
  if (editingId.value === null) return;
  const name = editingName.value.trim();
  if (!name) return;
  try {
    await personsApi.rename(editingId.value, name);
    editingId.value = null;
    await load();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

async function removePerson(p: Person) {
  if (
    !window.confirm(
      `${p.name} wirklich entfernen? Alle zugehörigen Ausgaben werden ebenfalls gelöscht.`,
    )
  ) {
    return;
  }
  try {
    await personsApi.remove(p.id);
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
      <h1>Personen</h1>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Lade…</p>

    <form class="add-person" @submit.prevent="addPerson">
      <input v-model="newName" type="text" placeholder="Name der Person" required />
      <button type="submit" class="btn btn-primary">Hinzufügen</button>
    </form>

    <p v-if="!loading && persons.length === 0" class="empty">
      Noch keine Personen vorhanden. Füge oben die erste Person hinzu.
    </p>

    <ul class="person-list">
      <li v-for="p in persons" :key="p.id" class="person-row">
        <template v-if="editingId === p.id">
          <input
            v-model="editingName"
            type="text"
            class="person-edit-input"
            @keyup.enter="saveEdit"
          />
          <div class="person-actions">
            <button class="btn btn-primary btn-sm" @click="saveEdit">Speichern</button>
            <button class="btn btn-secondary btn-sm" @click="editingId = null">Abbrechen</button>
          </div>
        </template>
        <template v-else>
          <span class="person-name">{{ p.name }}</span>
          <div class="person-actions">
            <button class="icon-btn" title="Umbenennen" @click="startEdit(p)">✏️</button>
            <button class="icon-btn" title="Entfernen" @click="removePerson(p)">🗑️</button>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>
