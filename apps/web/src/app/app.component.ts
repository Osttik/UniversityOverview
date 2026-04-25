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
    shortName: 'KNU',
    city: 'Kyiv',
    country: 'Ukraine',
    address: '60 Volodymyrska Street, Kyiv, Ukraine',
    summary: 'A classic research university with broad humanities, science, law, economics, and technology programs.',
    programs: 98,
    students: 26000,
    faculties: 13,
    website: 'https://knu.ua',
    contacts: {
      email: 'office.chief@univ.net.ua',
      phone: '+380 44 239 31 41'
    },
    coordinates: {
      latitude: 50.4419,
      longitude: 30.5119
    },
    images: {
      brand: {
        src: '/assets/images/legacy/legacy-brand.jpg',
        alt: 'Legacy UniversityProgramm brand image',
        legacySource: 'UniversityProgramm/jojo.jpg'
      },
      campusMap: {
        src: '/assets/images/legacy/campus-map.jpg',
        alt: 'Legacy campus map image from the WPF application',
        legacySource: 'UniversityProgramm/Images/1.1.jpg'
      }
    },
    featuredPrograms: [
      {
        id: 'knu-computer-science',
        title: 'Computer Science',
        degree: 'Bachelor',
        faculty: 'Faculty of Computer Science and Cybernetics',
        durationYears: 4,
        language: 'Ukrainian'
      },
      {
        id: 'knu-law',
        title: 'Law',
        degree: 'Master',
        faculty: 'Educational and Scientific Institute of Law',
        durationYears: 2,
        language: 'Ukrainian'
      }
    ]
  },
  {
    id: 'kpi',
    name: 'Igor Sikorsky Kyiv Polytechnic Institute',
    shortName: 'KPI',
    city: 'Kyiv',
    country: 'Ukraine',
    address: '37 Beresteiskyi Avenue, Kyiv, Ukraine',
    summary: 'A large technical university focused on engineering, applied sciences, information technology, and innovation.',
    programs: 121,
    students: 25000,
    faculties: 18,
    website: 'https://kpi.ua',
    contacts: {
      email: 'mail@kpi.ua',
      phone: '+380 44 204 94 94'
    },
    coordinates: {
      latitude: 50.4493,
      longitude: 30.4569
    },
    images: {},
    featuredPrograms: [
      {
        id: 'kpi-software-engineering',
        title: 'Software Engineering',
        degree: 'Bachelor',
        faculty: 'Faculty of Informatics and Computer Engineering',
        durationYears: 4,
        language: 'Ukrainian'
      },
      {
        id: 'kpi-electronics',
        title: 'Electronics',
        degree: 'Bachelor',
        faculty: 'Faculty of Electronics',
        durationYears: 4,
        language: 'Ukrainian'
      }
    ]
  },
  {
    id: 'lnu',
    name: 'Ivan Franko National University of Lviv',
    shortName: 'LNU',
    city: 'Lviv',
    country: 'Ukraine',
    address: '1 Universytetska Street, Lviv, Ukraine',
    summary: 'A comprehensive university serving western Ukraine with strong science, language, law, and social science programs.',
    programs: 83,
    students: 19000,
    faculties: 19,
    website: 'https://lnu.edu.ua',
    contacts: {
      email: 'zag_kan@lnu.edu.ua',
      phone: '+380 32 239 41 11'
    },
    coordinates: {
      latitude: 49.8404,
      longitude: 24.0221
    },
    images: {},
    featuredPrograms: [
      {
        id: 'lnu-international-relations',
        title: 'International Relations',
        degree: 'Bachelor',
        faculty: 'Faculty of International Relations',
        durationYears: 4,
        language: 'Ukrainian'
      },
      {
        id: 'lnu-applied-mathematics',
        title: 'Applied Mathematics',
        degree: 'Bachelor',
        faculty: 'Faculty of Applied Mathematics and Informatics',
        durationYears: 4,
        language: 'Ukrainian'
      }
    ]
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
