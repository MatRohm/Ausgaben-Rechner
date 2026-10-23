<script setup lang="ts"></script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="brand">
        <span class="brand-icon">💰</span>
        <span class="brand-name">Ausgaben-Rechner</span>
      </div>
      <nav class="nav">
        <RouterLink class="nav-link" to="/">Ausgaben</RouterLink>
        <RouterLink class="nav-link" to="/ausgleich">Ausgleich</RouterLink>
        <RouterLink class="nav-link" to="/abrechnungen">Abrechnungen</RouterLink>
        <RouterLink class="nav-link" to="/personen">Personen</RouterLink>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>
