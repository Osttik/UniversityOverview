import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { apiErrorInterceptor } from './api-error.interceptor';
import { API_BASE_URL } from './api.tokens';

export interface UniversityApiConfig {
  baseUrl?: string;
}

export function provideUniversityApi(config: UniversityApiConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withInterceptors([apiErrorInterceptor])),
    {
      provide: API_BASE_URL,
      useValue: config.baseUrl ?? '/api'
    }
  ]);
}
