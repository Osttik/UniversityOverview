import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchState, University, UniversityFilters } from './models';

@Injectable({ providedIn: 'root' })
export class UniversityApiService {
  private readonly baseUrl = 'http://localhost:3000/api/universities';

  constructor(private readonly http: HttpClient) {}

  getFilters(): Observable<UniversityFilters> {
    return this.http.get<UniversityFilters>(`${this.baseUrl}/filters`);
  }

  search(filters: SearchState): Observable<University[]> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== false && value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<University[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<University> {
    return this.http.get<University>(`${this.baseUrl}/${id}`);
  }
}
