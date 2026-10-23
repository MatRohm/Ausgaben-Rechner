import { createRouter, createWebHistory } from 'vue-router';
import { ExpensesView } from '@/modules/expenses';
import { PersonsView } from '@/modules/persons';
import { AusgleichView } from '@/modules/settlement';
import { SettlesView } from '@/modules/settles';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'expenses', component: ExpensesView },
    { path: '/ausgleich', name: 'ausgleich', component: AusgleichView },
    { path: '/abrechnungen', name: 'settles', component: SettlesView },
    { path: '/personen', name: 'persons', component: PersonsView },
  ],
});
