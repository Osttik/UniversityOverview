<script setup lang="ts">
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import { apiClient } from '@/services/apiClient';
import type { Program } from '@/types/university';

const route = useRoute();
const program = ref<Program | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

function formatTuition() {
  if (!program.value?.tuitionPerYear) {
    return 'Tuition on request';
  }

  return `${new Intl.NumberFormat('en-US').format(program.value.tuitionPerYear.amount)} ${program.value.tuitionPerYear.currency}/year`;
}

async function loadProgram() {
  loading.value = true;
  error.value = null;
  program.value = null;

  try {
    const response = await apiClient.get<{ data: Program }>(`/programs/${route.params.id}`);
    program.value = response.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load program details';
  } finally {
    loading.value = false;
  }
}

watch(() => route.params.id, loadProgram);
onMounted(loadProgram);
</script>

<template>
  <RouterLink to="/programs" class="back-link">
    <i class="pi pi-arrow-left" aria-hidden="true"></i>
    Programs
  </RouterLink>

  <p v-if="error" class="error-message">{{ error }}</p>
  <div v-else-if="loading" class="loading-block">
    <ProgressSpinner aria-label="Loading program details" />
  </div>

  <template v-else-if="program">
    <section class="detail-hero panel">
      <div>
        <p class="eyebrow">{{ program.degree }} · {{ program.field }}</p>
        <h2>{{ program.name }}</h2>
        <p>{{ program.description }}</p>
        <div class="tag-row">
          <Tag :value="program.studyMode" />
          <Tag severity="secondary" :value="program.language" />
          <Tag v-for="tag in program.tags" :key="tag" severity="secondary" :value="tag" />
        </div>
      </div>
      <div class="detail-stats">
        <span><strong>{{ program.durationYears }}</strong> years</span>
        <span><strong>{{ formatTuition() }}</strong> tuition</span>
        <span><strong>{{ program.campus?.city }}</strong> campus city</span>
      </div>
    </section>

    <section class="overview-columns">
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">University</p>
            <h2>{{ program.university?.name }}</h2>
          </div>
        </div>
        <p>{{ program.university?.city }}, {{ program.university?.country }}</p>
        <RouterLink v-if="program.university" :to="`/universities/${program.university.id}`">
          <Button label="Open university" icon="pi pi-building-columns" outlined />
        </RouterLink>
      </article>

      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Faculty and campus</p>
            <h2>{{ program.faculty?.name }}</h2>
          </div>
        </div>
        <p>{{ program.campus?.name }} · {{ program.campus?.address }}</p>
        <div class="fact-grid">
          <span><i class="pi pi-map-marker" aria-hidden="true"></i>{{ program.campus?.city }}</span>
          <span><i class="pi pi-book" aria-hidden="true"></i>{{ program.field }}</span>
          <span><i class="pi pi-language" aria-hidden="true"></i>{{ program.language }}</span>
        </div>
      </article>
    </section>
  </template>

  <p v-else class="empty-state">Program not found.</p>
</template>
