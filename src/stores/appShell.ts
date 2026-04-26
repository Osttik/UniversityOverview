import { defineStore } from 'pinia';

export const useAppShellStore = defineStore('appShell', {
  state: () => ({
    sidebarOpen: false,
    searchTerm: '',
    lastSyncLabel: 'Local draft',
  }),
  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    closeSidebar() {
      this.sidebarOpen = false;
    },
    setSearchTerm(value: string) {
      this.searchTerm = value;
    },
  },
});
