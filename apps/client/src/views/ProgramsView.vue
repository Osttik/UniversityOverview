<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import { apiClient } from '@/services/apiClient';
import type { ApiListResponse, CatalogFilters, Program } from '@/types/university';

const filters = reactive({
  search: '',
  universityId: '',
  field: '',
  degree: '',
  language: '',
  studyMode: '',
  city: '',
  maxTuition: null as number | null,
  sort: 'name',
});

const programs = ref<Program[]>([]);
const options = ref<CatalogFilters | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const visibleCount = computed(() => programs.value.length);

const sortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Field', value: 'field' },
  { label: 'Tuition', value: 'tuition' },
  { label: 'Duration', value: 'duration' },
];

function buildQuery() {
  const params = new URLSearchParams({ limit: '100', sort: filters.sort });

  for (const [key, value] of Object.entries(filters)) {
    if (key === 'sort' || value === '' || value === null) {
      continue;
    }

    params.set(key, String(value));
  }

  return params.toString();
}

function formatTuition(program: Program) {
  if (!program.tuitionPerYear) {
    return 'On request';
  }

  return `${new Intl.NumberFormat('en-US').format(program.tuitionPerYear.amount)} ${program.tuitionPerYear.currency}`;
}

function years(value: number) {
  return `${value} ${value === 1 ? 'year' : 'years'}`;
}

function clearFilters() {
  filters.search = '';
  filters.universityId = '';
  filters.field = '';
  filters.degree = '';
  filters.language = '';
  filters.studyMode = '';
  filters.city = '';
  filters.maxTuition = null;
  filters.sort = 'name';
}

async function loadFilters() {
  const response = await apiClient.get<{ data: CatalogFilters }>('/filters');
  options.value = response.data;
}

async function loadPrograms() {
  loading.value = true;
  error.value = null;

  try {
    const response = await apiClient.get<ApiListResponse<Program>>(`/programs?${buildQuery()}`);
    programs.value = response.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load programs';
  } finally {
    loading.value = false;
  }
}

watch(filters, loadPrograms, { deep: true });

onMounted(async () => {
  await Promise.all([loadFilters(), loadPrograms()]);
});
</script>

<template>
  <section class="panel catalog-toolbar program-toolbar">
    <div>
      <p class="eyebrow">Programs</p>
      <h2>Search study options</h2>
    </div>

    <span class="inline-search">
      <i class="pi pi-search" aria-hidden="true"></i>
      <InputText v-model="filters.search" placeholder="Program, degree, field, language" aria-label="Search programs" />
    </span>

    <Dropdown
      v-model="filters.universityId"
      :options="options?.universities ?? []"
      option-label="name"
      option-value="id"
      placeholder="All universities"
      show-clear
    />
    <Dropdown v-model="filters.field" :options="options?.fields ?? []" placeholder="All fields" show-clear />
    <Dropdown v-model="filters.degree" :options="options?.degrees ?? []" placeholder="All degrees" show-clear />
    <Dropdown v-model="filters.studyMode" :options="options?.studyModes ?? []" placeholder="All modes" show-clear />
    <Dropdown v-model="filters.language" :options="options?.languages ?? []" placeholder="All languages" show-clear />
    <Dropdown v-model="filters.city" :options="options?.cities ?? []" placeholder="All cities" show-clear />
    <InputNumber v-model="filters.maxTuition" input-id="maxTuition" placeholder="Max tuition" :min="0" mode="decimal" />
    <Dropdown v-model="filters.sort" :options="sortOptions" option-label="label" option-value="value" placeholder="Sort" />
    <Button label="Clear" icon="pi pi-filter-slash" severity="secondary" outlined @click="clearFilters" />
  </section>

  <div class="list-heading">
    <Tag :value="`${visibleCount} programs`" />
    <Button icon="pi pi-refresh" text rounded aria-label="Refresh programs" :loading="loading" @click="loadPrograms" />
  </div>

  <p v-if="error" class="error-message">{{ error }}</p>
  <div v-else-if="loading" class="loading-block">
    <ProgressSpinner aria-label="Loading programs" />
  </div>

  <section v-else-if="programs.length" class="program-card-list" aria-label="Programs">
    <Card v-for="program in programs" :key="program.id" class="program-card">
      <template #title>{{ program.name }}</template>
      <template #subtitle>{{ program.university?.name }} · {{ program.field }}</template>
      <template #content>
        <p>{{ program.description }}</p>
        <div class="fact-grid">
          <span><i class="pi pi-graduation-cap" aria-hidden="true"></i>{{ program.degree }}</span>
          <span><i class="pi pi-clock" aria-hidden="true"></i>{{ years(program.durationYears) }}</span>
          <span><i class="pi pi-wallet" aria-hidden="true"></i>{{ formatTuition(program) }}/year</span>
          <span><i class="pi pi-map-marker" aria-hidden="true"></i>{{ program.campus?.city ?? 'Campus' }}</span>
        </div>
        <div class="tag-row">
          <Tag :value="program.studyMode" />
          <Tag severity="secondary" :value="program.language" />
          <Tag v-for="tag in program.tags" :key="tag" severity="secondary" :value="tag" />
        </div>
      </template>
      <template #footer>
        <RouterLink :to="`/programs/${program.id}`">
          <Button label="View program" icon="pi pi-arrow-right" icon-pos="right" />
        </RouterLink>
      </template>
    </Card>
  </section>

  <p v-else class="empty-state">No programs match the selected filters.</p>
</template>
