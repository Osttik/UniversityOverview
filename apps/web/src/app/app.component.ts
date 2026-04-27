import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { Faculty, StudyProgram, University, UniversityApiService } from './core/api';
import {
  UiBadgeComponent,
  UiButtonDirective,
  UiCardComponent,
  UiEmptyStateComponent,
  UiLoadingComponent
} from './shared/ui';

interface DetailMetric {
  label: string;
  value: string;
  tone: 'info' | 'success' | 'warning';
}

@Component({
  selector: 'uo-root',
  standalone: true,
  imports: [
    UiBadgeComponent,
    UiButtonDirective,
    UiCardComponent,
    UiEmptyStateComponent,
    UiLoadingComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly universityApi = inject(UniversityApiService);

  protected readonly universities = signal<University[]>([]);
  protected readonly selectedUniversity = signal<University | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadingDetail = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly faculties = computed(() => this.selectedUniversity()?.faculties ?? []);
  protected readonly programs = computed(() => this.faculties().flatMap((faculty) => faculty.programs ?? []));
  protected readonly metrics = computed<DetailMetric[]>(() => {
    const university = this.selectedUniversity();
    const faculties = this.faculties();
    const programs = this.programs();

    return [
      {
        label: 'Faculties',
        value: String(university?.facultyCount ?? faculties.length),
        tone: 'info'
      },
      {
        label: 'Programs',
        value: String(university?.programCount ?? programs.length),
        tone: 'success'
      },
      {
        label: 'Study modes',
        value: String(new Set(programs.map((program) => program.mode).filter(Boolean)).size),
        tone: 'warning'
      }
    ];
  });

  constructor() {
    this.loadUniversities();
  }

  protected selectUniversity(universityId: string): void {
    if (this.selectedUniversity()?.id === universityId) {
      return;
    }

    this.loadingDetail.set(true);
    this.error.set(null);

    this.universityApi.getUniversity(universityId).subscribe({
      next: (university) => {
        this.selectedUniversity.set(university);
        this.loadingDetail.set(false);
      },
      error: () => {
        this.error.set('University details could not be loaded. Check the API connection and try again.');
        this.loadingDetail.set(false);
      }
    });
  }

  protected programSummary(program: StudyProgram): string {
    const duration = program.durationYears ? `${program.durationYears} years` : 'Duration pending';
    const mode = program.mode ? toTitleCase(program.mode.replace('-', ' ')) : 'Mode pending';

    return `${program.degree} / ${duration} / ${mode}`;
  }

  protected tuition(program: StudyProgram): string {
    if (!program.tuitionPerYear) {
      return 'Tuition pending';
    }

    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
      style: 'currency',
      currency: 'UAH'
    }).format(program.tuitionPerYear);
  }

  protected facultyProgramCount(faculty: Faculty): number {
    return faculty.programCount ?? faculty.programs?.length ?? 0;
  }

  protected loadUniversities(): void {
    this.loading.set(true);
    this.error.set(null);

    this.universityApi.listUniversities().subscribe({
      next: (collection) => {
        this.universities.set(collection.items);
        this.loading.set(false);

        const firstUniversity = collection.items[0];
        if (firstUniversity) {
          this.selectUniversity(firstUniversity.id);
        }
      },
      error: () => {
        this.error.set('Universities could not be loaded. Check the API connection and try again.');
        this.loading.set(false);
      }
    });
  }
}

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, (match) => match.toUpperCase());
}
