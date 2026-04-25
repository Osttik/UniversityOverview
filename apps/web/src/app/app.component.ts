import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface University {
  id: string;
  name: string;
  city: string;
  region: string;
  founded: number;
  students: number;
  rating: number;
  tuitionUsd: number;
  categories: string[];
  programs: string[];
  highlights: string[];
  campus: {
    x: number;
    y: number;
    label: string;
  };
}

@Component({
  selector: 'uo-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatChipsModule, MatProgressBarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  readonly universities = signal<University[]>([]);
  readonly selectedId = signal<string>('');
  readonly activeCategory = signal<string>('All');
  readonly searchText = signal<string>('');
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  readonly categories = computed(() => ['All', ...new Set(this.universities().flatMap((university) => university.categories))].sort((a, b) => {
    if (a === 'All') {
      return -1;
    }
    if (b === 'All') {
      return 1;
    }
    return a.localeCompare(b);
  }));

  readonly filteredUniversities = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    const category = this.activeCategory();

    return this.universities().filter((university) => {
      const matchesCategory = category === 'All' || university.categories.includes(category);
      const matchesQuery = !query || [
        university.name,
        university.city,
        university.region,
        ...university.programs,
        ...university.highlights,
      ].some((value) => value.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  });

  readonly selectedUniversity = computed(() => {
    const selected = this.universities().find((university) => university.id === this.selectedId());
    return selected ?? this.filteredUniversities()[0] ?? null;
  });

  readonly totalStudents = computed(() => this.universities().reduce((sum, university) => sum + university.students, 0));
  readonly averageRating = computed(() => {
    const universities = this.universities();
    return universities.length ? universities.reduce((sum, university) => sum + university.rating, 0) / universities.length : 0;
  });

  private readonly apiBase = window.location.port === '3000' ? '' : 'http://localhost:3000';

  constructor(private readonly httpClient: HttpClient) {}

  ngOnInit(): void {
    this.loadUniversities();
  }

  selectUniversity(universityId: string): void {
    this.selectedId.set(universityId);
  }

  selectCategory(category: string): void {
    this.activeCategory.set(category);
  }

  updateSearch(value: string): void {
    this.searchText.set(value);
  }

  clearFilters(): void {
    this.searchText.set('');
    this.activeCategory.set('All');
  }

  loadUniversities(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const params = new HttpParams();

    this.httpClient.get<University[]>(`${this.apiBase}/api/universities`, { params }).subscribe({
      next: (universities) => {
        this.universities.set(universities);
        this.selectedId.set(universities[0]?.id ?? '');
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('The API is unavailable. Start the Nest backend on port 3000 and refresh.');
        this.isLoading.set(false);
      },
    });
  }

  formatStudents(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  formatTuition(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
