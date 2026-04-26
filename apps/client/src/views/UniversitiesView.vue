<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import { apiClient } from '@/services/apiClient';
import type { ApiListResponse, CatalogFilters, University } from '@/types/university';

const filters = reactive({
  search: '',
  city: '',
  country: '',
  type: '',
  sort: 'name',
});

const universities = ref<University[]>([]);
const options = ref<CatalogFilters | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const visibleCount = computed(() => universities.value.length);

const sortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'City', value: 'city' },
  { label: 'Students', value: 'students' },
  { label: 'Founded', value: 'founded' },
  { label: 'Programs', value: 'programs' },
];

function buildQuery() {
  const params = new URLSearchParams({ limit: '100', sort: filters.sort });

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.city) {
    params.set('city', filters.city);
  }

  if (filters.country) {
    params.set('country', filters.country);
  }

  if (filters.type) {
    params.set('type', filters.type);
  }

  return params.toString();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function programLabels(university: University) {
  return university.programs.filter((program): program is string => typeof program === 'string');
}

function clearFilters() {
  filters.search = '';
  filters.city = '';
  filters.country = '';
  filters.type = '';
  filters.sort = 'name';
}

async function loadFilters() {
  const response = await apiClient.get<{ data: CatalogFilters }>('/filters');
  options.value = response.data;
}

async function loadUniversities() {
  loading.value = true;
  error.value = null;

  try {
    const response = await apiClient.get<ApiListResponse<University>>(`/universities?${buildQuery()}`);
    universities.value = response.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load universities';
  } finally {
    loading.value = false;
  }
}

watch(filters, loadUniversities, { deep: true });

onMounted(async () => {
  await Promise.all([loadFilters(), loadUniversities()]);
});
</script>

<template>
  <section class="panel catalog-toolbar">
    <div>
      <p class="eyebrow">Directory</p>
      <h2>Search universities</h2>
    </div>

    <span class="inline-search">
      <i class="pi pi-search" aria-hidden="true"></i>
      <InputText v-model="filters.search" placeholder="Name, city, program, keyword" aria-label="Search universities" />
    </span>

    <Dropdown v-model="filters.city" :options="options?.cities ?? []" placeholder="All cities" show-clear />
    <Dropdown v-model="filters.country" :options="options?.countries ?? []" placeholder="All countries" show-clear />
    <Dropdown v-model="filters.type" :options="options?.universityTypes ?? []" placeholder="All types" show-clear />
    <Dropdown v-model="filters.sort" :options="sortOptions" option-label="label" option-value="value" placeholder="Sort" />

    <Button label="Clear" icon="pi pi-filter-slash" severity="secondary" outlined @click="clearFilters" />
  </section>

  <div class="list-heading">
    <Tag :value="`${visibleCount} universities`" />
    <Button icon="pi pi-refresh" text rounded aria-label="Refresh universities" :loading="loading" @click="loadUniversities" />
  </div>

  <p v-if="error" class="error-message">{{ error }}</p>
  <div v-else-if="loading" class="loading-block">
    <ProgressSpinner aria-label="Loading universities" />
  </div>

  <section v-else-if="universities.length" class="entity-grid" aria-label="Universities">
    <Card v-for="university in universities" :key="university.id" class="entity-card">
      <template #title>{{ university.name }}</template>
      <template #subtitle>{{ university.shortName ?? university.type }} · {{ university.city }}, {{ university.country }}</template>
      <template #content>
        <p>{{ university.description }}</p>
        <div class="fact-grid">
          <span><i class="pi pi-users" aria-hidden="true"></i>{{ formatNumber(university.students) }} students</span>
          <span><i class="pi pi-book" aria-hidden="true"></i>{{ university.counts?.programs ?? university.programs?.length ?? 0 }} programs</span>
          <span><i class="pi pi-calendar" aria-hidden="true"></i>Founded {{ university.founded }}</span>
        </div>
        <div class="tag-row">
          <Tag :value="university.type ?? 'University'" />
          <Tag v-for="program in programLabels(university)" :key="program" severity="secondary" :value="program" />
        </div>
      </template>
      <template #footer>
        <RouterLink :to="`/universities/${university.id}`">
          <Button label="Open details" icon="pi pi-arrow-right" icon-pos="right" />
        </RouterLink>
      </template>
    </Card>
  </section>

  <p v-else class="empty-state">No universities match the selected filters.</p>
</template>
