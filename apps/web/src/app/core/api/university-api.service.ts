import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiClient } from './api-client.service';
import {
  ApiCollection,
  ApiItemResponse,
  ApiListResponse,
  Faculty,
  ProgramSearchParams,
  StudyProgram,
  University,
  UniversitySearchParams
} from './api.models';

@Injectable({ providedIn: 'root' })
export class UniversityApiService {
  private readonly api = inject(ApiClient);

  listUniversities(params: UniversitySearchParams = {}): Observable<ApiCollection<University>> {
    return this.api.get<ApiListResponse<University>>('/universities', params).pipe(map(toCollection));
  }

  getUniversity(id: string): Observable<University> {
    return this.api.get<ApiItemResponse<University>>(`/universities/${id}`).pipe(map((response) => response.data));
  }

  listUniversityFaculties(id: string): Observable<ApiCollection<Faculty>> {
    return this.api.get<ApiListResponse<Faculty>>(`/universities/${id}/faculties`).pipe(map(toCollection));
  }

  listFaculties(): Observable<ApiCollection<Faculty>> {
    return this.api.get<ApiListResponse<Faculty>>('/faculties').pipe(map(toCollection));
  }

  getFaculty(id: string): Observable<Faculty> {
    return this.api.get<ApiItemResponse<Faculty>>(`/faculties/${id}`).pipe(map((response) => response.data));
  }

  listPrograms(params: ProgramSearchParams = {}): Observable<ApiCollection<StudyProgram>> {
    return this.api.get<ApiListResponse<StudyProgram>>('/programs', params).pipe(map(toCollection));
  }

  getProgram(id: string): Observable<StudyProgram> {
    return this.api.get<ApiItemResponse<StudyProgram>>(`/programs/${id}`).pipe(map((response) => response.data));
  }
}

function toCollection<T>(response: ApiListResponse<T>): ApiCollection<T> {
  return {
    items: response.data,
    total: response.count ?? response.data.length
  };
}
