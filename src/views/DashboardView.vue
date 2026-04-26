<script setup lang="ts">
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { RouterLink } from 'vue-router';

const metrics = [
  { label: 'Tracked universities', value: '24', tone: 'info' },
  { label: 'Active programs', value: '148', tone: 'success' },
  { label: 'Pending reviews', value: '6', tone: 'warn' },
];

const activity = [
  'Campus map shell migrated from the desktop prototype.',
  'University list prepared for JSON-backed API data.',
  'Navigation, search, and responsive layout are wired.',
];
</script>

<template>
  <section class="dashboard-grid">
    <article class="hero-panel">
      <div>
        <Tag severity="info" value="Vue Shell" />
        <h2>Modern university operations workspace</h2>
        <p>
          The application shell is ready for Express endpoints, local JSON data, and richer
          university workflows while preserving the old project's map-first direction.
        </p>
      </div>
      <RouterLink to="/map">
        <Button label="Open map" icon="pi pi-map" />
      </RouterLink>
    </article>

    <article v-for="metric in metrics" :key="metric.label" class="metric-card">
      <span>{{ metric.label }}</span>
      <strong>{{ metric.value }}</strong>
      <Tag :severity="metric.tone" value="Current" />
    </article>
  </section>

  <section class="panel">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Status</p>
        <h2>Implementation notes</h2>
      </div>
      <RouterLink to="/universities">
        <Button label="View universities" icon="pi pi-building-columns" outlined />
      </RouterLink>
    </div>

    <ul class="activity-list">
      <li v-for="item in activity" :key="item">
        <i class="pi pi-check-circle" aria-hidden="true"></i>
        <span>{{ item }}</span>
      </li>
    </ul>
  </section>
</template>
