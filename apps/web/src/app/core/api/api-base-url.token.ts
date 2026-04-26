import { InjectionToken } from '@angular/core';

declare global {
  interface Window {
    __UNIVERSITY_OVERVIEW_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

function resolveApiBaseUrl(): string {
  const configuredBaseUrl = window.__UNIVERSITY_OVERVIEW_CONFIG__?.apiBaseUrl?.trim();
  if (configuredBaseUrl) {
    const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, '');
    if (normalizedBaseUrl) {
      return normalizedBaseUrl;
    }
  }

  const localStaticHost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (localStaticHost && window.location.port !== '3000') {
    return `http://${window.location.hostname}:3000/api`;
  }

  return '/api';
}

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: resolveApiBaseUrl
});
