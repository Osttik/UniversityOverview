import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api-base-url.token';
import {
  ApiUniversity,
  ProgramSearchQuery,
  UniversityListResponse,
  UniversityProgramsResponse,
  UniversitySearchQuery
} from '../models/university.models';

@Injectable({ providedIn: 'root' })
export class UniversityApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  listUniversities(query: UniversitySearchQuery = {}): Observable<UniversityListResponse> {
    const params = new HttpParams({ fromObject: this.toParams(query) });

    return this.http.get<UniversityListResponse>(`${this.baseUrl}/universities`, { params });
  }

  getUniversity(universityId: string): Observable<ApiUniversity> {
    return this.http.get<ApiUniversity>(`${this.baseUrl}/universities/${universityId}`);
  }

  listPrograms(
    universityId: string,
    query: ProgramSearchQuery = {}
  ): Observable<UniversityProgramsResponse> {
    const params = new HttpParams({ fromObject: this.toParams(query) });

    return this.http.get<UniversityProgramsResponse>(
      `${this.baseUrl}/universities/${universityId}/programs`,
      { params }
    );
  }

  private toParams(query: UniversitySearchQuery | ProgramSearchQuery): Record<string, string> {
    return Object.fromEntries(
      Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    );
  }
}
