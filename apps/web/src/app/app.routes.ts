import { Routes } from '@angular/router';

import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CampusMapComponent } from './features/campus-map/campus-map.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview'
  },
  {
    path: 'overview',
    component: DashboardComponent,
    title: 'University Overview'
  },
  {
    path: 'map',
    component: CampusMapComponent,
    title: 'Campus Map'
  },
  {
    path: '**',
    redirectTo: 'overview'
  }
];
