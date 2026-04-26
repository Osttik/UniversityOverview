<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import { apiClient } from '@/services/apiClient';
import type { Program, University } from '@/types/university';

const route = useRoute();
const university = ref<University | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const programs = computed(() =>
  (university.value?.programs ?? []).filter((program): program is Program => typeof program !== 'string'),
);
const campuses = computed(() => university.value?.campuses ?? []);
const faculties = computed(() => university.value?.faculties ?? []);

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatTuition(program: Program) {
  if (!program.tuitionPerYear) {
    return 'On request';
  }

  return `${formatNumber(program.tuitionPerYear.amount)} ${program.tuitionPerYear.currency}`;
}

async function loadUniversity() {
  loading.value = true;
  error.value = null;
  university.value = null;

  try {
    const response = await apiClient.get<{ data: University }>(`/universities/${route.params.id}`);
    university.value = response.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load university details';
  } finally {
    loading.value = false;
  }
}

watch(() => route.params.id, loadUniversity);
onMounted(loadUniversity);
</script>

<template>
  <RouterLink to="/universities" class="back-link">
    <i class="pi pi-arrow-left" aria-hidden="true"></i>
    Universities
  </RouterLink>

  <p v-if="error" class="error-message">{{ error }}</p>
  <div v-else-if="loading" class="loading-block">
    <ProgressSpinner aria-label="Loading university details" />
  </div>

  <template v-else-if="university">
    <section class="detail-hero panel">
      <div>
        <p class="eyebrow">{{ university.shortName }} · {{ university.type }}</p>
        <h2>{{ university.name }}</h2>
        <p>{{ university.description }}</p>
        <div class="detail-actions">
          <a v-if="university.website" :href="university.website" target="_blank" rel="noreferrer">
            <Button label="Open website" icon="pi pi-external-link" outlined />
          </a>
          <RouterLink to="/programs">
            <Button label="Compare programs" icon="pi pi-book" />
          </RouterLink>
        </div>
      </div>
      <div class="detail-stats">
        <span><strong>{{ formatNumber(university.students) }}</strong> students</span>
        <span><strong>{{ programs.length }}</strong> programs</span>
        <span><strong>{{ university.founded }}</strong> founded</span>
      </div>
    </section>

    <section class="overview-columns">
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Campuses</p>
            <h2>{{ campuses.length }} locations</h2>
          </div>
        </div>
        <div class="compact-card-list">
          <div v-for="campus in campuses" :key="campus.id" class="compact-card">
            <div>
              <p>{{ campus.city }}, {{ campus.country }}</p>
              <h3>{{ campus.name }}</h3>
              <span>{{ campus.address }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Faculties</p>
            <h2>{{ faculties.length }} academic units</h2>
          </div>
        </div>
        <div class="compact-card-list">
          <div v-for="faculty in faculties" :key="faculty.id" class="compact-card">
            <div>
              <p>{{ faculty.shortName }}</p>
              <h3>{{ faculty.name }}</h3>
              <span>{{ faculty.description }}</span>
            </div>
            <Tag :value="`${faculty.programIds.length} programs`" />
          </div>
        </div>
      </article>
    </section>

    <section class="panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Programs</p>
          <h2>Study options at {{ university.shortName ?? university.name }}</h2>
        </div>
      </div>
      <div class="program-card-list compact">
        <Card v-for="program in programs" :key="program.id" class="program-card">
          <template #title>{{ program.name }}</template>
          <template #subtitle>{{ program.degree }} · {{ program.field }}</template>
          <template #content>
            <p>{{ program.description }}</p>
            <div class="fact-grid">
              <span><i class="pi pi-clock" aria-hidden="true"></i>{{ program.durationYears }} years</span>
              <span><i class="pi pi-wallet" aria-hidden="true"></i>{{ formatTuition(program) }}/year</span>
              <span><i class="pi pi-map-marker" aria-hidden="true"></i>{{ program.campus?.name }}</span>
            </div>
          </template>
          <template #footer>
            <RouterLink :to="`/programs/${program.id}`">
              <Button label="Open program" icon="pi pi-arrow-right" icon-pos="right" text />
            </RouterLink>
          </template>
        </Card>
      </div>
    </section>
  </template>

  <p v-else class="empty-state">University not found.</p>
</template>
