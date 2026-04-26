<script setup lang="ts">
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

import { routes } from '@/router';
import { useAppShellStore } from '@/stores/appShell';

const route = useRoute();
const shell = useAppShellStore();

const navigationItems = computed(() =>
  routes.map((item) => ({
    path: item.path,
    label: String(item.meta?.label ?? item.name),
    icon: String(item.meta?.icon ?? 'pi pi-circle'),
  })),
);

const currentTitle = computed(() => String(route.meta.label ?? 'University Overview'));
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ 'sidebar-open': shell.sidebarOpen }">
      <div class="brand">
        <div class="brand-mark">UO</div>
        <div>
          <span>University</span>
          <strong>Overview</strong>
        </div>
      </div>

      <nav class="navigation" aria-label="Primary navigation">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="navigation-link"
          active-class="navigation-link-active"
          @click="shell.closeSidebar"
        >
          <i :class="item.icon" aria-hidden="true"></i>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-status">
        <Tag severity="success" :value="shell.lastSyncLabel" />
        <span>Ready for the Express API.</span>
      </div>
    </aside>

    <button
      v-if="shell.sidebarOpen"
      class="sidebar-scrim"
      aria-label="Close navigation"
      @click="shell.closeSidebar"
    ></button>

    <div class="workspace">
      <header class="topbar">
        <div class="topbar-left">
          <Button
            icon="pi pi-bars"
            text
            rounded
            aria-label="Open navigation"
            class="menu-button"
            @click="shell.toggleSidebar"
          />
          <div>
            <p class="eyebrow">Workspace</p>
            <h1>{{ currentTitle }}</h1>
          </div>
        </div>

        <span class="search-field">
          <i class="pi pi-search" aria-hidden="true"></i>
          <InputText
            :model-value="shell.searchTerm"
            placeholder="Search universities"
            aria-label="Search universities"
            @update:model-value="shell.setSearchTerm(String($event))"
          />
        </span>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
