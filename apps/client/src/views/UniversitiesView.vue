<script setup lang="ts">
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import { computed, onMounted, ref } from 'vue';

import { apiClient } from '@/services/apiClient';
import { useAppShellStore } from '@/stores/appShell';
import type { ApiListResponse, University } from '@/types/university';

const shell = useAppShellStore();
const universities = ref<University[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function loadUniversities() {
  loading.value = true;
  error.value = null;

  try {
    const response = await apiClient.get<ApiListResponse<University>>('/universities');
    universities.value = response.data;
    shell.setLastSyncLabel('Synced');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load universities';
    shell.setLastSyncLabel('Offline');
  } finally {
    loading.value = false;
  }
}

const filteredUniversities = computed(() => {
  const needle = shell.searchTerm.trim().toLowerCase();

  if (!needle) {
    return universities.value;
  }

  return universities.value.filter((university) =>
    [university.name, university.shortName, university.city, university.country, university.type].some((value) =>
      value?.toLowerCase().includes(needle),
    ) ||
    university.programs.some((value) =>
      value.toLowerCase().includes(needle),
    ),
  );
});

function typeSeverity(type?: string) {
  if (type === 'Public') {
    return 'success';
  }

  return 'info';
}

onMounted(loadUniversities);
</script>

<template>
  <section class="panel">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Directory</p>
        <h2>Universities</h2>
      </div>
      <Tag :value="`${filteredUniversities.length} visible`" />
      <Button icon="pi pi-refresh" text rounded aria-label="Refresh universities" :loading="loading" @click="loadUniversities" />
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>

    <DataTable :value="filteredUniversities" data-key="id" responsive-layout="scroll" :loading="loading">
      <Column field="name" header="Name"></Column>
      <Column field="city" header="City"></Column>
      <Column field="country" header="Country"></Column>
      <Column header="Programs">
        <template #body="{ data }">
          {{ data.programs.length }}
        </template>
      </Column>
      <Column field="students" header="Students">
        <template #body="{ data }">
          {{ data.students.toLocaleString() }}
        </template>
      </Column>
      <Column field="founded" header="Founded"></Column>
      <Column header="Type">
        <template #body="{ data }">
          <Tag :severity="typeSeverity(data.type)" :value="data.type ?? 'University'" />
        </template>
      </Column>
    </DataTable>
  </section>
</template>
