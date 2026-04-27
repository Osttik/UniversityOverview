import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  Faculty,
  FacultyPayload,
  StudyProgram,
  StudyProgramPayload,
  University,
  UniversityApiService,
  UniversityPayload
} from './core/api';
import { UiBadgeComponent, UiButtonDirective, UiEmptyStateComponent, UiLoadingComponent } from './shared/ui';

type AdminSection = 'universities' | 'faculties' | 'programs';
type StudyMode = NonNullable<StudyProgram['mode']>;
type UniversityStatus = NonNullable<University['status']>;

interface UniversityForm {
  name: string;
  shortName: string;
  city: string;
  country: string;
  website: string;
  status: UniversityStatus;
  description: string;
  latitude: number;
  longitude: number;
  email: string;
  phone: string;
}

interface FacultyForm {
  universityId: string;
  name: string;
  dean: string;
  description: string;
}

interface ProgramForm {
  facultyId: string;
  name: string;
  degree: string;
  mode: StudyMode;
  durationYears: number;
  language: string;
  tuitionPerYear: number;
  description: string;
}

@Component({
  selector: 'uo-root',
  standalone: true,
  imports: [CommonModule, FormsModule, UiBadgeComponent, UiButtonDirective, UiEmptyStateComponent, UiLoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly universityApi = inject(UniversityApiService);

  protected readonly sections: AdminSection[] = ['universities', 'faculties', 'programs'];
  protected readonly statuses: UniversityStatus[] = ['active', 'inactive', 'draft'];
  protected readonly studyModes: StudyMode[] = ['full-time', 'part-time', 'online', 'hybrid'];
  protected readonly activeSection = signal<AdminSection>('universities');
  protected readonly selectedIds = signal<Record<AdminSection, string | null>>({
    universities: null,
    faculties: null,
    programs: null
  });
  protected readonly universities = signal<University[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal('Catalog ready for editing.');

  protected universityForm: UniversityForm = emptyUniversityForm();
  protected facultyForm: FacultyForm = emptyFacultyForm();
  protected programForm: ProgramForm = emptyProgramForm();

  protected readonly faculties = computed(() =>
    this.universities().flatMap((university) =>
      (university.faculties ?? []).map((faculty) => ({
        ...faculty,
        universityId: faculty.universityId ?? university.id
      }))
    )
  );
  protected readonly programs = computed(() =>
    this.universities().flatMap((university) =>
      (university.faculties ?? []).flatMap((faculty) =>
        (faculty.programs ?? []).map((program) => ({
          ...program,
          universityId: university.id,
          facultyId: program.facultyId ?? faculty.id,
          facultyName: program.facultyName ?? faculty.name
        }))
      )
    )
  );

  constructor() {
    this.loadCatalog();
  }

  protected open(section: AdminSection): void {
    this.activeSection.set(section);
    this.clearForm(section);
  }

  protected selectedId(section = this.activeSection()): string | null {
    return this.selectedIds()[section];
  }

  protected clearForm(section = this.activeSection()): void {
    this.selectedIds.update((ids) => ({ ...ids, [section]: null }));

    if (section === 'universities') {
      this.universityForm = emptyUniversityForm();
      return;
    }

    if (section === 'faculties') {
      this.facultyForm = emptyFacultyForm(this.universities()[0]?.id ?? '');
      return;
    }

    this.programForm = emptyProgramForm(this.faculties()[0]?.id ?? '');
  }

  protected selectUniversity(university: University): void {
    this.activeSection.set('universities');
    this.selectedIds.update((ids) => ({ ...ids, universities: university.id }));
    this.universityForm = {
      name: university.name,
      shortName: university.shortName ?? '',
      city: university.city ?? '',
      country: university.country ?? 'Ukraine',
      website: university.website ?? '',
      status: university.status ?? 'draft',
      description: university.description ?? '',
      latitude: university.coordinates?.latitude ?? 0,
      longitude: university.coordinates?.longitude ?? 0,
      email: university.contacts?.email ?? '',
      phone: university.contacts?.phone ?? ''
    };
  }

  protected selectFaculty(faculty: Faculty): void {
    this.activeSection.set('faculties');
    this.selectedIds.update((ids) => ({ ...ids, faculties: faculty.id }));
    this.facultyForm = {
      universityId: faculty.universityId ?? this.universities()[0]?.id ?? '',
      name: faculty.name,
      dean: faculty.dean ?? '',
      description: faculty.description ?? ''
    };
  }

  protected selectProgram(program: StudyProgram): void {
    this.activeSection.set('programs');
    this.selectedIds.update((ids) => ({ ...ids, programs: program.id }));
    this.programForm = {
      facultyId: program.facultyId ?? this.faculties()[0]?.id ?? '',
      name: program.name,
      degree: program.degree,
      mode: program.mode ?? 'full-time',
      durationYears: program.durationYears ?? 0,
      language: program.language ?? 'Ukrainian',
      tuitionPerYear: program.tuitionPerYear ?? 0,
      description: program.description ?? ''
    };
  }

  protected saveUniversity(): void {
    const payload: UniversityPayload = {
      name: this.universityForm.name.trim(),
      shortName: this.universityForm.shortName.trim(),
      city: this.universityForm.city.trim(),
      country: this.universityForm.country.trim(),
      website: this.universityForm.website.trim(),
      status: this.universityForm.status,
      description: this.universityForm.description.trim(),
      coordinates: {
        latitude: Number(this.universityForm.latitude) || 0,
        longitude: Number(this.universityForm.longitude) || 0
      },
      contacts: {
        email: this.universityForm.email.trim(),
        phone: this.universityForm.phone.trim()
      }
    };
    const selectedId = this.selectedId('universities');
    const request = selectedId
      ? this.universityApi.updateUniversity(selectedId, payload)
      : this.universityApi.createUniversity(payload);

    this.persist<University>(request, 'University saved.', (university) => {
      this.selectedIds.update((ids) => ({ ...ids, universities: university.id }));
      this.selectUniversity(university);
    });
  }

  protected saveFaculty(): void {
    const payload: FacultyPayload = {
      universityId: this.facultyForm.universityId,
      name: this.facultyForm.name.trim(),
      dean: this.facultyForm.dean.trim(),
      description: this.facultyForm.description.trim()
    };
    const selectedId = this.selectedId('faculties');
    const request = selectedId ? this.universityApi.updateFaculty(selectedId, payload) : this.universityApi.createFaculty(payload);

    this.persist<Faculty>(request, 'Faculty saved.', (faculty) => {
      this.selectedIds.update((ids) => ({ ...ids, faculties: faculty.id }));
      this.selectFaculty(faculty);
    });
  }

  protected saveProgram(): void {
    const payload: StudyProgramPayload = {
      facultyId: this.programForm.facultyId,
      name: this.programForm.name.trim(),
      degree: this.programForm.degree.trim(),
      mode: this.programForm.mode,
      durationYears: Number(this.programForm.durationYears) || 0,
      language: this.programForm.language.trim(),
      tuitionPerYear: Number(this.programForm.tuitionPerYear) || 0,
      description: this.programForm.description.trim()
    };
    const selectedId = this.selectedId('programs');
    const request = selectedId ? this.universityApi.updateProgram(selectedId, payload) : this.universityApi.createProgram(payload);

    this.persist<StudyProgram>(request, 'Program saved.', (program) => {
      this.selectedIds.update((ids) => ({ ...ids, programs: program.id }));
      this.selectProgram(program);
    });
  }

  protected deleteSelected(): void {
    const section = this.activeSection();
    const selectedId = this.selectedId(section);

    if (!selectedId) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const request =
      section === 'universities'
        ? this.universityApi.deleteUniversity(selectedId)
        : section === 'faculties'
          ? this.universityApi.deleteFaculty(selectedId)
          : this.universityApi.deleteProgram(selectedId);

    request.subscribe({
      next: () => {
        this.clearForm(section);
        this.notice.set(`${sectionLabel(section)} deleted.`);
        this.loadCatalog(false);
      },
      error: (error: unknown) => this.handleError(error),
      complete: () => this.saving.set(false)
    });
  }

  protected universityName(universityId?: string): string {
    return this.universities().find((university) => university.id === universityId)?.name ?? 'Unassigned';
  }

  protected facultyName(facultyId?: string): string {
    return this.faculties().find((faculty) => faculty.id === facultyId)?.name ?? 'Unassigned';
  }

  protected facultyUniversity(facultyId?: string): string {
    const faculty = this.faculties().find((item) => item.id === facultyId);
    return this.universityName(faculty?.universityId);
  }

  protected sectionLabel(section = this.activeSection()): string {
    return sectionLabel(section);
  }

  protected loadCatalog(showLoading = true): void {
    if (showLoading) {
      this.loading.set(true);
    }

    this.error.set(null);

    this.universityApi.listUniversities().subscribe({
      next: (collection) => {
        this.universities.set(collection.items);
        this.loading.set(false);

        if (!this.facultyForm.universityId) {
          this.facultyForm.universityId = collection.items[0]?.id ?? '';
        }

        if (!this.programForm.facultyId) {
          this.programForm.facultyId = this.faculties()[0]?.id ?? '';
        }
      },
      error: (error: unknown) => this.handleError(error)
    });
  }

  private persist<T>(request: Observable<T>, successMessage: string, select: (item: T) => void): void {
    this.saving.set(true);
    this.error.set(null);

    request.subscribe({
      next: (item) => {
        this.notice.set(successMessage);
        select(item);
        this.loadCatalog(false);
      },
      error: (error: unknown) => this.handleError(error),
      complete: () => this.saving.set(false)
    });
  }

  private handleError(error: unknown): void {
    this.loading.set(false);
    this.saving.set(false);

    if (error instanceof HttpErrorResponse) {
      const message = typeof error.error?.message === 'string' ? error.error.message : error.message;
      this.error.set(message || 'Request failed.');
      return;
    }

    this.error.set('Request failed.');
  }
}

function emptyUniversityForm(): UniversityForm {
  return {
    name: '',
    shortName: '',
    city: '',
    country: 'Ukraine',
    website: '',
    status: 'draft',
    description: '',
    latitude: 0,
    longitude: 0,
    email: '',
    phone: ''
  };
}

function emptyFacultyForm(universityId = ''): FacultyForm {
  return {
    universityId,
    name: '',
    dean: '',
    description: ''
  };
}

function emptyProgramForm(facultyId = ''): ProgramForm {
  return {
    facultyId,
    name: '',
    degree: 'Bachelor',
    mode: 'full-time',
    durationYears: 4,
    language: 'Ukrainian',
    tuitionPerYear: 0,
    description: ''
  };
}

function sectionLabel(section: AdminSection): string {
  return section === 'universities' ? 'University' : section === 'faculties' ? 'Faculty' : 'Program';
}
