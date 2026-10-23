import { createRouter, createWebHistory } from 'vue-router';
import ExpensesView from '../views/ExpensesView.vue';
import AusgleichView from '../views/AusgleichView.vue';
import SettlesView from '../views/SettlesView.vue';
import PersonsView from '../views/PersonsView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'expenses', component: ExpensesView },
    { path: '/ausgleich', name: 'ausgleich', component: AusgleichView },
    { path: '/abrechnungen', name: 'settles', component: SettlesView },
    { path: '/personen', name: 'persons', component: PersonsView },
  ],
});
