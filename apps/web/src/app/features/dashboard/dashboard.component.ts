import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { UniversitySummary } from '../../core/models/university.models';

@Component({
  selector: 'uo-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  readonly metrics = [
    { label: 'Universities', value: '24', icon: 'school' },
    { label: 'Programs', value: '318', icon: 'menu_book' },
    { label: 'Campus points', value: '1,482', icon: 'location_on' }
  ] as const;

  readonly universities: UniversitySummary[] = [
    {
      id: 'khpi',
      name: 'National Technical University',
      city: 'Kharkiv',
      country: 'Ukraine',
      campusesCount: 4,
      programsCount: 72,
      rating: 4.7
    },
    {
      id: 'knu',
      name: 'Taras Shevchenko National University',
      city: 'Kyiv',
      country: 'Ukraine',
      campusesCount: 6,
      programsCount: 96,
      rating: 4.8
    }
  ];
}
