import { Routes } from '@angular/router';

import { OverviewPageComponent } from './overview-page.component';
import { ProgramsPageComponent } from './programs-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OverviewPageComponent,
    title: 'University Overview'
  },
  {
    path: 'programs',
    component: ProgramsPageComponent,
    title: 'Programs'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
