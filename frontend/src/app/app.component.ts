import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

interface UniversityOverview {
  id: string;
  name: string;
  city: string;
  programs: string[];
  mapLabel: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly http = inject(HttpClient);

  error = '';
  selectedUniversityId = '';
  universities: UniversityOverview[] = [];

  get selectedUniversity(): UniversityOverview | undefined {
    return this.universities.find((university) => university.id === this.selectedUniversityId);
  }

  ngOnInit(): void {
    this.http.get<UniversityOverview[]>('/api/universities').subscribe({
      next: (universities) => {
        this.universities = universities;
        this.selectedUniversityId = universities[0]?.id ?? '';
      },
      error: () => {
        this.error = 'University data is unavailable.';
      }
    });
  }

  selectUniversity(universityId: string): void {
    this.selectedUniversityId = universityId;
  }
}
