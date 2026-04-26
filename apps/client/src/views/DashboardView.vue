<script setup lang="ts">
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { apiClient } from '@/services/apiClient';
import type { ApiListResponse, CatalogFilters, Program, University } from '@/types/university';

const universities = ref<University[]>([]);
const programs = ref<Program[]>([]);
const filters = ref<CatalogFilters | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const totalStudents = computed(() =>
  universities.value.reduce((sum, university) => sum + university.students, 0),
);

const totalTuition = computed(() =>
  programs.value.reduce((sum, program) => sum + (program.tuitionPerYear?.amount ?? 0), 0),
);

const averageTuition = computed(() =>
  programs.value.length ? Math.round(totalTuition.value / programs.value.length) : 0,
);

const featuredUniversities = computed(() => universities.value.slice(0, 3));
const featuredPrograms = computed(() => programs.value.slice(0, 4));

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatTuition(program: Program) {
  if (!program.tuitionPerYear) {
    return 'Tuition on request';
  }

  return `${formatNumber(program.tuitionPerYear.amount)} ${program.tuitionPerYear.currency}/year`;
}

async function loadOverview() {
  loading.value = true;
  error.value = null;

  try {
    const [universityResponse, programResponse, filterResponse] = await Promise.all([
      apiClient.get<ApiListResponse<University>>('/universities?limit=100'),
      apiClient.get<ApiListResponse<Program>>('/programs?limit=100'),
      apiClient.get<{ data: CatalogFilters }>('/filters'),
    ]);

    universities.value = universityResponse.data;
    programs.value = programResponse.data;
    filters.value = filterResponse.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load the catalog overview';
  } finally {
    loading.value = false;
  }
}

onMounted(loadOverview);
</script>

<template>
  <section class="dashboard-grid">
    <article class="hero-panel catalog-hero">
      <div>
        <Tag severity="info" value="Admissions catalog" />
        <h2>University and program overview</h2>
        <p>
          Browse JSON-backed universities, compare study programs, and open detail pages served by
          the Express API.
        </p>
      </div>
      <div class="hero-actions">
        <RouterLink to="/universities">
          <Button label="Find universities" icon="pi pi-building-columns" />
        </RouterLink>
        <RouterLink to="/programs">
          <Button label="Compare programs" icon="pi pi-book" outlined />
        </RouterLink>
      </div>
    </article>

    <article class="metric-card">
      <span>Tracked universities</span>
      <strong>{{ formatNumber(universities.length) }}</strong>
      <Tag severity="info" value="Live API" />
    </article>
    <article class="metric-card">
      <span>Available programs</span>
      <strong>{{ formatNumber(programs.length) }}</strong>
      <Tag severity="success" value="Searchable" />
    </article>
    <article class="metric-card">
      <span>Students represented</span>
      <strong>{{ formatNumber(totalStudents) }}</strong>
      <Tag severity="contrast" value="Across catalog" />
    </article>
    <article class="metric-card">
      <span>Average tuition</span>
      <strong>{{ formatNumber(averageTuition) }}</strong>
      <Tag severity="warn" value="UAH/year" />
    </article>
  </section>

  <p v-if="error" class="error-message">{{ error }}</p>
  <div v-else-if="loading" class="loading-block">
    <ProgressSpinner aria-label="Loading overview" />
  </div>

  <section v-else class="overview-columns">
    <article class="panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Universities</p>
          <h2>Featured institutions</h2>
        </div>
        <RouterLink to="/universities">
          <Button label="All universities" icon="pi pi-arrow-right" icon-pos="right" text />
        </RouterLink>
      </div>

      <div class="compact-card-list">
        <RouterLink
          v-for="university in featuredUniversities"
          :key="university.id"
          :to="`/universities/${university.id}`"
          class="compact-card"
        >
          <div>
            <p>{{ university.shortName ?? university.type }}</p>
            <h3>{{ university.name }}</h3>
            <span>{{ university.city }}, {{ university.country }}</span>
          </div>
          <Tag :value="`${university.counts?.programs ?? university.programs?.length ?? 0} programs`" />
        </RouterLink>
      </div>
    </article>

    <article class="panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Programs</p>
          <h2>Popular options</h2>
        </div>
        <RouterLink to="/programs">
          <Button label="All programs" icon="pi pi-arrow-right" icon-pos="right" text />
        </RouterLink>
      </div>

      <div class="compact-card-list">
        <RouterLink
          v-for="program in featuredPrograms"
          :key="program.id"
          :to="`/programs/${program.id}`"
          class="compact-card"
        >
          <div>
            <p>{{ program.degree }} · {{ program.field }}</p>
            <h3>{{ program.name }}</h3>
            <span>{{ program.university?.shortName ?? program.university?.name }} · {{ formatTuition(program) }}</span>
          </div>
          <Tag :value="program.studyMode" />
        </RouterLink>
      </div>
    </article>
  </section>

  <section v-if="filters" class="panel filter-summary">
    <div>
      <p class="eyebrow">Catalog coverage</p>
      <h2>{{ filters.cities.length }} cities, {{ filters.fields.length }} study fields</h2>
    </div>
    <div class="tag-row">
      <Tag v-for="field in filters.fields" :key="field" :value="field" />
    </div>
  </section>
</template>
