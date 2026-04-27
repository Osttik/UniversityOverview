import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { environment } from '../environments/environment';
import { provideUniversityApi } from './core/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter([]),
    provideUniversityApi({ baseUrl: environment.apiBaseUrl })
  ]
};
