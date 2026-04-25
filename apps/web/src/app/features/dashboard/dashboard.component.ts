import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';

import { UniversityApiService } from '../../core/api/university-api.service';
import { ApiUniversity, UniversitySearchQuery } from '../../core/models/university.models';

@Component({
  selector: 'uo-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  protected readonly universities = signal<ApiUniversity[]>([]);
  protected readonly allUniversities = signal<ApiUniversity[]>([]);
  protected readonly searchText = signal('');
  protected readonly selectedCity = signal('');
  protected readonly selectedDegree = signal('');
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly metrics = computed(() => {
    const universities = this.allUniversities();
    const programs = universities.reduce((total, university) => total + university.programs, 0);
    const faculties = universities.reduce((total, university) => total + university.faculties, 0);

    return [
      { label: 'Universities', value: universities.length.toLocaleString(), icon: 'school' },
      { label: 'Programs', value: programs.toLocaleString(), icon: 'menu_book' },
      { label: 'Faculties', value: faculties.toLocaleString(), icon: 'account_balance' }
    ] as const;
  });
  protected readonly cities = computed(() =>
    Array.from(new Set(this.allUniversities().map((university) => university.city))).sort()
  );
  protected readonly degrees = computed(() =>
    Array.from(
      new Set(
        this.allUniversities().flatMap((university) =>
          university.featuredPrograms.map((program) => program.degree)
        )
      )
    ).sort()
  );

  private readonly universityApi = inject(UniversityApiService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadInitialUniversities();
  }

  protected updateSearch(value: string): void {
    this.searchText.set(value);
    this.refreshUniversities();
  }

  protected updateCity(value: string): void {
    this.selectedCity.set(value);
    this.refreshUniversities();
  }

  protected updateDegree(value: string): void {
    this.selectedDegree.set(value);
    this.refreshUniversities();
  }

  protected clearFilters(): void {
    this.searchText.set('');
    this.selectedCity.set('');
    this.selectedDegree.set('');
    this.refreshUniversities();
  }

  private loadInitialUniversities(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.universityApi
      .listUniversities()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (universities) => {
          this.allUniversities.set(universities);
          this.universities.set(universities);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Universities could not be loaded.');
          this.isLoading.set(false);
        }
      });
  }

  private refreshUniversities(): void {
    const query: UniversitySearchQuery = {
      search: this.searchText(),
      city: this.selectedCity(),
      degree: this.selectedDegree()
    };

    this.universityApi
      .listUniversities(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (universities) => {
          this.universities.set(universities);
          this.errorMessage.set(null);
        },
        error: () => {
          this.errorMessage.set('University filters could not be applied.');
        }
      });
  }
}
