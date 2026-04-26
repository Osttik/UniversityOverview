import { createRouter, createWebHistory } from 'vue-router';

import DashboardView from '@/views/DashboardView.vue';
import MapView from '@/views/MapView.vue';
import UniversitiesView from '@/views/UniversitiesView.vue';

export const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { label: 'Overview', icon: 'pi pi-home' },
  },
  {
    path: '/universities',
    name: 'universities',
    component: UniversitiesView,
    meta: { label: 'Universities', icon: 'pi pi-building-columns' },
  },
  {
    path: '/map',
    name: 'map',
    component: MapView,
    meta: { label: 'Map', icon: 'pi pi-map' },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
