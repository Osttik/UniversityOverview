import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Observable, catchError, of } from 'rxjs';
import type { University } from '@university-overview/shared';

const FALLBACK_UNIVERSITIES: University[] = [
  {
    id: 'knu',
    name: 'Taras Shevchenko National University of Kyiv',
    city: 'Kyiv',
    country: 'Ukraine',
    programs: 98,
    students: 26000,
    website: 'https://knu.ua'
  },
  {
    id: 'kpi',
    name: 'Igor Sikorsky Kyiv Polytechnic Institute',
    city: 'Kyiv',
    country: 'Ukraine',
    programs: 121,
    students: 25000,
    website: 'https://kpi.ua'
  },
  {
    id: 'lnu',
    name: 'Ivan Franko National University of Lviv',
    city: 'Lviv',
    country: 'Ukraine',
    programs: 83,
    students: 19000,
    website: 'https://lnu.edu.ua'
  }
];

@Component({
  selector: 'uo-root',
  standalone: true,
  imports: [AsyncPipe, DecimalPipe, MatButtonModule, MatCardModule, MatChipsModule, MatToolbarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly http = inject(HttpClient);

  readonly universities$: Observable<University[]> = this.http
    .get<University[]>('/api/universities')
    .pipe(catchError(() => of(FALLBACK_UNIVERSITIES)));
}
