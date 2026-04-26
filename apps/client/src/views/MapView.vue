<script setup lang="ts">
import Button from 'primevue/button';
import Slider from 'primevue/slider';
import Tag from 'primevue/tag';
import { computed, ref } from 'vue';

import mapImageUrl from '../../../../UniversityProgramm/Images/1.1.jpg';
import type { MapPoint } from '@/types/university';

const zoom = ref(100);
const offsetX = ref(0);
const offsetY = ref(0);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

const mapPoints: MapPoint[] = [
  { id: 'main', label: 'Main hall', x: 38, y: 45, kind: 'building' },
  { id: 'admissions', label: 'Admissions', x: 56, y: 34, kind: 'office' },
  { id: 'library', label: 'Library', x: 64, y: 58, kind: 'landmark' },
];

const mapTransform = computed(() => ({
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${zoom.value / 100})`,
}));

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
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
}
</script>

<template>
  <section class="map-layout">
    <div class="panel map-panel">
      <div class="panel-heading map-heading">
        <div>
          <p class="eyebrow">Campus</p>
          <h2>Interactive map</h2>
        </div>
        <div class="map-actions">
          <Button icon="pi pi-minus" rounded outlined aria-label="Zoom out" @click="zoomBy(-10)" />
          <Button icon="pi pi-plus" rounded outlined aria-label="Zoom in" @click="zoomBy(10)" />
          <Button label="Reset" icon="pi pi-refresh" text @click="resetMap" />
        </div>
      </div>

      <div
        class="map-viewport"
        :class="{ dragging: isDragging }"
        @pointerdown="startDrag"
        @pointermove="dragMap"
        @pointerup="stopDrag"
        @pointercancel="stopDrag"
        @wheel.prevent="zoomBy($event.deltaY > 0 ? -10 : 10)"
      >
        <div class="map-stage" :style="mapTransform">
          <img :src="mapImageUrl" alt="University campus map" draggable="false" />
          <button
            v-for="point in mapPoints"
            :key="point.id"
            class="map-point"
            :class="`map-point-${point.kind}`"
            :style="{ left: `${point.x}%`, top: `${point.y}%` }"
            type="button"
          >
            <i class="pi pi-map-marker" aria-hidden="true"></i>
            <span>{{ point.label }}</span>
          </button>
        </div>
      </div>
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
      <div class="map-point-list">
        <Tag v-for="point in mapPoints" :key="point.id" :value="point.label" />
      </div>
    </aside>
  </section>
</template>
