<script setup lang="ts">
import { computed } from 'vue';
import { findExpenseIcon } from './expenseIcons';

const props = defineProps<{
  description: string;
}>();

const icon = computed(() => findExpenseIcon(props.description));
</script>

<template>
  <span v-if="icon" class="expense-icon" role="img" :aria-label="icon.label" :title="icon.label">
    {{ icon.icon }}
  </span>
</template>
