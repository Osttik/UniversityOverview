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
  StudyProgramPayload,
  University,
  FacultyPayload,
  UniversityPayload,
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

  createUniversity(payload: UniversityPayload): Observable<University> {
    return this.api.post<ApiItemResponse<University>, UniversityPayload>('/universities', payload).pipe(
      map((response) => response.data)
    );
  }

  updateUniversity(id: string, payload: UniversityPayload): Observable<University> {
    return this.api.put<ApiItemResponse<University>, UniversityPayload>(`/universities/${id}`, payload).pipe(
      map((response) => response.data)
    );
  }

  deleteUniversity(id: string): Observable<void> {
    return this.api.delete<void>(`/universities/${id}`);
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

  createFaculty(payload: FacultyPayload): Observable<Faculty> {
    return this.api.post<ApiItemResponse<Faculty>, FacultyPayload>('/faculties', payload).pipe(
      map((response) => response.data)
    );
  }

  updateFaculty(id: string, payload: FacultyPayload): Observable<Faculty> {
    return this.api.put<ApiItemResponse<Faculty>, FacultyPayload>(`/faculties/${id}`, payload).pipe(
      map((response) => response.data)
    );
  }

  deleteFaculty(id: string): Observable<void> {
    return this.api.delete<void>(`/faculties/${id}`);
  }

  listPrograms(params: ProgramSearchParams = {}): Observable<ApiCollection<StudyProgram>> {
    return this.api.get<ApiListResponse<StudyProgram>>('/programs', params).pipe(map(toCollection));
  }

  getProgram(id: string): Observable<StudyProgram> {
    return this.api.get<ApiItemResponse<StudyProgram>>(`/programs/${id}`).pipe(map((response) => response.data));
  }

  createProgram(payload: StudyProgramPayload): Observable<StudyProgram> {
    return this.api.post<ApiItemResponse<StudyProgram>, StudyProgramPayload>('/programs', payload).pipe(
      map((response) => response.data)
    );
  }

  updateProgram(id: string, payload: StudyProgramPayload): Observable<StudyProgram> {
    return this.api.put<ApiItemResponse<StudyProgram>, StudyProgramPayload>(`/programs/${id}`, payload).pipe(
      map((response) => response.data)
    );
  }

  deleteProgram(id: string): Observable<void> {
    return this.api.delete<void>(`/programs/${id}`);
  }
}

function toCollection<T>(response: ApiListResponse<T>): ApiCollection<T> {
  return {
    items: response.data,
    total: response.count ?? response.data.length
  };
}
