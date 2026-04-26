import { createRouter, createWebHistory } from 'vue-router';

import DashboardView from '@/views/DashboardView.vue';
import MapView from '@/views/MapView.vue';
import ProgramDetailView from '@/views/ProgramDetailView.vue';
import ProgramsView from '@/views/ProgramsView.vue';
import UniversityDetailView from '@/views/UniversityDetailView.vue';
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
    path: '/universities/:id',
    name: 'university-detail',
    component: UniversityDetailView,
    meta: { label: 'University detail', icon: 'pi pi-building-columns', nav: false },
  },
  {
    path: '/programs',
    name: 'programs',
    component: ProgramsView,
    meta: { label: 'Programs', icon: 'pi pi-book' },
  },
  {
    path: '/programs/:id',
    name: 'program-detail',
    component: ProgramDetailView,
    meta: { label: 'Program detail', icon: 'pi pi-book', nav: false },
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
