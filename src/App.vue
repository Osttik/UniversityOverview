<script setup>
import { computed, onMounted, reactive, ref } from 'vue';

const campus = ref(null);
const selectedMarkerId = ref(null);
const loading = ref(true);
const error = ref('');
const viewport = ref(null);

const transform = reactive({
  scale: 1,
  x: 0,
  y: 0
});

const drag = reactive({
  active: false,
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0
});

const selectedMarker = computed(() => {
  return campus.value?.markers.find((marker) => marker.id === selectedMarkerId.value) ?? null;
});

const markerTypes = {
  academic: 'Academic',
  study: 'Study',
  research: 'Research',
  services: 'Services',
  athletics: 'Athletics'
};

onMounted(async () => {
  try {
    const response = await fetch('/api/campus');

    if (!response.ok) {
      throw new Error('Campus data request failed.');
    }

    campus.value = await response.json();
    selectedMarkerId.value = campus.value.markers[0]?.id ?? null;
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    loading.value = false;
  }
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setScale(nextScale, focalPoint = null) {
  const oldScale = transform.scale;
  const scale = clamp(nextScale, 0.65, 3);

  if (scale === oldScale) {
    return;
  }

  if (focalPoint) {
    const mapX = (focalPoint.x - transform.x) / oldScale;
    const mapY = (focalPoint.y - transform.y) / oldScale;
    transform.x = focalPoint.x - mapX * scale;
    transform.y = focalPoint.y - mapY * scale;
  }

  transform.scale = scale;
}

function zoomIn() {
  setScale(transform.scale + 0.2, getViewportCenter());
}

function zoomOut() {
  setScale(transform.scale - 0.2, getViewportCenter());
}

function resetMap() {
  transform.scale = 1;
  transform.x = 0;
  transform.y = 0;
}

function getViewportCenter() {
  const bounds = viewport.value?.getBoundingClientRect();

  if (!bounds) {
    return null;
  }

  return {
    x: bounds.width / 2,
    y: bounds.height / 2
  };
}

function onWheel(event) {
  event.preventDefault();

  const bounds = viewport.value.getBoundingClientRect();
  const focalPoint = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top
  };
  const direction = event.deltaY > 0 ? -1 : 1;

  setScale(transform.scale + direction * 0.12, focalPoint);
}

function startPan(event) {
  if (event.button !== 0) {
    return;
  }

  drag.active = true;
  drag.startX = event.clientX;
  drag.startY = event.clientY;
  drag.originX = transform.x;
  drag.originY = transform.y;
  viewport.value.setPointerCapture(event.pointerId);
}

function panMap(event) {
  if (!drag.active) {
    return;
  }

  transform.x = drag.originX + event.clientX - drag.startX;
  transform.y = drag.originY + event.clientY - drag.startY;
}

function endPan(event) {
  drag.active = false;

  if (viewport.value?.hasPointerCapture(event.pointerId)) {
    viewport.value.releasePointerCapture(event.pointerId);
  }
}

function selectMarker(marker) {
  selectedMarkerId.value = marker.id;
}
</script>

<template>
  <main class="page-shell">
    <aside class="campus-panel">
      <div>
        <p class="eyebrow">Campus overview</p>
        <h1>{{ campus?.name ?? 'University Campus' }}</h1>
      </div>

      <div v-if="selectedMarker" class="selected-place">
        <span>{{ markerTypes[selectedMarker.type] }}</span>
        <h2>{{ selectedMarker.name }}</h2>
        <p>{{ selectedMarker.description }}</p>
      </div>

      <div class="marker-list" aria-label="Campus places">
        <button
          v-for="marker in campus?.markers"
          :key="marker.id"
          type="button"
          :class="{ active: marker.id === selectedMarkerId }"
          @click="selectMarker(marker)"
        >
          <span>{{ marker.name }}</span>
          <small>{{ markerTypes[marker.type] }}</small>
        </button>
      </div>
    </aside>

    <section class="map-section" aria-label="Interactive campus map">
      <div class="map-toolbar">
        <button type="button" @click="zoomOut" aria-label="Zoom out">-</button>
        <span>{{ Math.round(transform.scale * 100) }}%</span>
        <button type="button" @click="zoomIn" aria-label="Zoom in">+</button>
        <button type="button" class="reset-button" @click="resetMap">Reset</button>
      </div>

      <div v-if="loading" class="map-state">Loading campus map...</div>
      <div v-else-if="error" class="map-state">{{ error }}</div>
      <div
        v-else
        ref="viewport"
        class="map-viewport"
        :class="{ panning: drag.active }"
        @wheel="onWheel"
        @pointerdown="startPan"
        @pointermove="panMap"
        @pointerup="endPan"
        @pointercancel="endPan"
      >
        <div
          class="map-canvas"
          :style="{
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`
          }"
        >
          <img :src="campus.image.src" :alt="campus.image.alt" draggable="false" />
          <button
            v-for="marker in campus.markers"
            :key="marker.id"
            type="button"
            class="map-marker"
            :class="{ active: marker.id === selectedMarkerId }"
            :style="{ left: `${marker.x}%`, top: `${marker.y}%` }"
            @click.stop="selectMarker(marker)"
          >
            <span>{{ marker.name }}</span>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
