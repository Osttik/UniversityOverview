<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  NButton,
  NCard,
  NConfigProvider,
  NGrid,
  NGridItem,
  NSpace,
  NSpin,
  NStatistic,
  NTag
} from "naive-ui";

interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  students: number;
  programs: string[];
  founded: number;
}

interface UniversitiesResponse {
  data: University[];
}

const universities = ref<University[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const totalStudents = computed(() =>
  universities.value.reduce((total, university) => total + university.students, 0)
);

function isUniversitiesResponse(value: unknown): value is UniversitiesResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray((value as { data: unknown }).data)
  );
}

async function loadUniversities() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch("/api/universities");

    if (!response.ok) {
      throw new Error(`API request failed with ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!isUniversitiesResponse(payload)) {
      throw new Error("API response did not include universities data");
    }

    universities.value = payload.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Unable to load universities";
  } finally {
    loading.value = false;
  }
}

onMounted(loadUniversities);
</script>

<template>
  <n-config-provider>
    <main class="page-shell">
      <section class="hero-panel">
        <div>
          <p class="eyebrow">University Overview</p>
          <h1>Explore academic programs and campus reach</h1>
          <p class="intro">
            A modern Vue client connected to a TypeScript Express API with local JSON data.
          </p>
        </div>
        <n-space class="hero-actions" align="center">
          <n-button type="primary" size="large" round :loading="loading" @click="loadUniversities">
            Refresh Data
          </n-button>
          <n-tag type="success" round>{{ universities.length }} universities</n-tag>
        </n-space>
      </section>

      <section class="stats-row">
        <n-statistic label="Institutions" :value="universities.length" />
        <n-statistic label="Students" :value="totalStudents" />
      </section>

      <n-spin :show="loading">
        <p v-if="error" class="error-message">{{ error }}</p>
        <n-grid v-else cols="1 s:2 l:3" responsive="screen" :x-gap="20" :y-gap="20">
          <n-grid-item v-for="university in universities" :key="university.id">
            <n-card :title="university.name" size="medium" hoverable>
              <p class="location">{{ university.city }}, {{ university.country }}</p>
              <p class="meta">
                Founded {{ university.founded }} · {{ university.students.toLocaleString() }} students
              </p>
              <n-space>
                <n-tag v-for="program in university.programs" :key="program" size="small">
                  {{ program }}
                </n-tag>
              </n-space>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-spin>
    </main>
  </n-config-provider>
</template>
