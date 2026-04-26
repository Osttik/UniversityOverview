<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import { computed } from 'vue';

import { useAppShellStore } from '@/stores/appShell';
import type { University } from '@/types/university';

const shell = useAppShellStore();

const universities: University[] = [
  {
    id: 'khpi',
    name: 'National Technical University KhPI',
    city: 'Kharkiv',
    status: 'active',
    programs: 42,
    applicants: 3840,
    updatedAt: '2026-04-20',
  },
  {
    id: 'knu',
    name: 'Taras Shevchenko National University',
    city: 'Kyiv',
    status: 'review',
    programs: 57,
    applicants: 6120,
    updatedAt: '2026-04-18',
  },
  {
    id: 'lpnu',
    name: 'Lviv Polytechnic National University',
    city: 'Lviv',
    status: 'active',
    programs: 49,
    applicants: 4388,
    updatedAt: '2026-04-21',
  },
  {
    id: 'onu',
    name: 'Odesa I. I. Mechnikov National University',
    city: 'Odesa',
    status: 'archived',
    programs: 31,
    applicants: 2190,
    updatedAt: '2026-03-30',
  },
];

const filteredUniversities = computed(() => {
  const needle = shell.searchTerm.trim().toLowerCase();

  if (!needle) {
    return universities;
  }

  return universities.filter((university) =>
    [university.name, university.city, university.status].some((value) =>
      value.toLowerCase().includes(needle),
    ),
  );
});

function statusSeverity(status: University['status']) {
  if (status === 'active') {
    return 'success';
  }

  if (status === 'review') {
    return 'warn';
  }

  return 'secondary';
}
</script>

<template>
  <section class="panel">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Directory</p>
        <h2>Universities</h2>
      </div>
      <Tag :value="`${filteredUniversities.length} visible`" />
    </div>

    <DataTable :value="filteredUniversities" data-key="id" responsive-layout="scroll">
      <Column field="name" header="Name"></Column>
      <Column field="city" header="City"></Column>
      <Column field="programs" header="Programs"></Column>
      <Column field="applicants" header="Applicants"></Column>
      <Column field="updatedAt" header="Updated"></Column>
      <Column header="Status">
        <template #body="{ data }">
          <Tag :severity="statusSeverity(data.status)" :value="data.status" />
        </template>
      </Column>
    </DataTable>
  </section>
</template>
