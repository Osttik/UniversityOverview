import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from './api-client.service';
import {
  ApiCollection,
  Application,
  ApplicationStatus,
  CreateApplicationRequest,
  Program,
  ProgramSearchParams,
  University,
  UniversitySearchParams
} from './api.models';

@Injectable({ providedIn: 'root' })
export class UniversityApiService {
  private readonly api = inject(ApiClient);

  listUniversities(params: UniversitySearchParams = {}): Observable<ApiCollection<University>> {
    return this.api.get<ApiCollection<University>>('/universities', params);
  }

  getUniversity(id: string): Observable<University> {
    return this.api.get<University>(`/universities/${id}`);
  }

  listPrograms(params: ProgramSearchParams = {}): Observable<ApiCollection<Program>> {
    return this.api.get<ApiCollection<Program>>('/programs', params);
  }

  getProgram(id: string): Observable<Program> {
    return this.api.get<Program>(`/programs/${id}`);
  }

  listApplications(programId?: string): Observable<ApiCollection<Application>> {
    return this.api.get<ApiCollection<Application>>('/applications', { programId });
  }

  createApplication(payload: CreateApplicationRequest): Observable<Application> {
    return this.api.post<Application, CreateApplicationRequest>('/applications', payload);
  }

  updateApplicationStatus(id: string, status: ApplicationStatus): Observable<Application> {
    return this.api.patch<Application, { status: ApplicationStatus }>(`/applications/${id}`, { status });
  }
}
