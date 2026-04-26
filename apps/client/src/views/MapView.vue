<script setup lang="ts">
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Slider from 'primevue/slider';
import Tag from 'primevue/tag';
import { computed, onMounted, ref } from 'vue';

import { apiClient } from '@/services/apiClient';
import type { CampusMap, CampusMapMarker } from '@/types/university';

const campusMap = ref<CampusMap | null>(null);
const selectedMarker = ref<CampusMapMarker | null>(null);
const zoom = ref(100);
const offsetX = ref(0);
const offsetY = ref(0);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const loading = ref(false);
const error = ref<string | null>(null);

const mapTransform = computed(() => ({
  transform: `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) scale(${zoom.value / 100})`,
}));

const mapAspectRatio = computed(() => {
  const image = campusMap.value?.image;
  return image ? `${image.width} / ${image.height}` : '4 / 3';
});

function resetMap() {
  zoom.value = 100;
  offsetX.value = 0;
  offsetY.value = 0;
}

function zoomBy(delta: number) {
  zoom.value = Math.min(160, Math.max(70, zoom.value + delta));
}

function startDrag(event: PointerEvent) {
  isDragging.value = true;
  dragStart.value = { x: event.clientX - offsetX.value, y: event.clientY - offsetY.value };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function dragMap(event: PointerEvent) {
  if (!isDragging.value) {
    return;
  }

  offsetX.value = event.clientX - dragStart.value.x;
  offsetY.value = event.clientY - dragStart.value.y;
}

function stopDrag(event: PointerEvent) {
  isDragging.value = false;
  const target = event.currentTarget as HTMLElement;

  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
}

function markerSeverity(type: string) {
  const severityByType: Record<string, 'success' | 'info' | 'warn' | 'contrast' | 'secondary'> = {
    academic: 'info',
    athletics: 'warn',
    research: 'success',
    services: 'contrast',
    study: 'secondary',
  };

  return severityByType[type] ?? 'secondary';
}

async function loadMap() {
  loading.value = true;
  error.value = null;

  try {
    const response = await apiClient.get<{ data: CampusMap }>('/campus-map');
    campusMap.value = response.data;
    selectedMarker.value = response.data.markers[0] ?? null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load the campus map';
  } finally {
    loading.value = false;
  }
}

onMounted(loadMap);
</script>

<template>
  <section class="map-layout">
    <div class="panel map-panel">
      <div class="panel-heading map-heading">
        <div>
          <p class="eyebrow">Campus</p>
          <h2>{{ campusMap?.name ?? 'Interactive map' }}</h2>
        </div>
        <div class="map-actions">
          <Button icon="pi pi-minus" rounded outlined aria-label="Zoom out" @click="zoomBy(-10)" />
          <Button icon="pi pi-plus" rounded outlined aria-label="Zoom in" @click="zoomBy(10)" />
          <Button label="Reset" icon="pi pi-refresh" text @click="resetMap" />
        </div>
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>
      <div v-else-if="loading" class="loading-block">
        <ProgressSpinner aria-label="Loading campus map" />
      </div>
      <div
        v-else-if="campusMap"
        class="map-viewport"
        :class="{ dragging: isDragging }"
        @pointerdown="startDrag"
        @pointermove="dragMap"
        @pointerup="stopDrag"
        @pointercancel="stopDrag"
        @wheel.prevent="zoomBy($event.deltaY > 0 ? -10 : 10)"
      >
        <div class="map-stage" :style="{ ...mapTransform, aspectRatio: mapAspectRatio }">
          <img :src="campusMap.image.src" :alt="campusMap.image.alt" draggable="false" />
          <button
            v-for="point in campusMap.markers"
            :key="point.id"
            class="map-point"
            :class="[`map-point-${point.type}`, { 'map-point-active': selectedMarker?.id === point.id }]"
            :style="{ left: `${point.x}%`, top: `${point.y}%` }"
            type="button"
            @click="selectedMarker = point"
            @pointerdown.stop
          >
            <i class="pi pi-map-marker" aria-hidden="true"></i>
            <span>{{ point.name }}</span>
          </button>
        </div>
      </div>
      <p v-else class="empty-state">No campus map data is available.</p>
    </div>

    <aside class="panel map-tools">
      <div>
        <p class="eyebrow">Controls</p>
        <h2>Map tools</h2>
      </div>
      <label class="zoom-control">
        <span>Zoom {{ zoom }}%</span>
        <Slider v-model="zoom" :min="70" :max="160" :step="5" />
      </label>

      <div v-if="selectedMarker" class="selected-marker">
        <Tag :severity="markerSeverity(selectedMarker.type)" :value="selectedMarker.type" />
        <h3>{{ selectedMarker.name }}</h3>
        <p>{{ selectedMarker.description }}</p>
      </div>

      <div v-if="campusMap" class="map-point-list">
        <button
          v-for="point in campusMap.markers"
          :key="point.id"
          class="map-point-chip"
          :class="{ 'map-point-chip-active': selectedMarker?.id === point.id }"
          type="button"
          @click="selectedMarker = point"
        >
          <span>{{ point.name }}</span>
          <Tag :severity="markerSeverity(point.type)" :value="point.type" />
        </button>
      </div>
    </aside>
  </section>
</template>
