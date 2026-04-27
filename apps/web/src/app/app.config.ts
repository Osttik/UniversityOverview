import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { environment } from '../environments/environment';
import { provideUniversityApi } from './core/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideRouter([]),
    provideUniversityApi({ baseUrl: environment.apiBaseUrl })
  ]
};
