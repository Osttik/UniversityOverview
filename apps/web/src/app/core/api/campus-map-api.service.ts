import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api-base-url.token';
import {
  CampusMap,
  LocationSearchQuery,
  RoutePlan,
  RouteRequest
} from '../models/campus-map.models';

@Injectable({ providedIn: 'root' })
export class CampusMapApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getCampusMap(universityId: string): Observable<CampusMap> {
    return this.http.get<CampusMap>(`${this.baseUrl}/universities/${universityId}/map`);
  }

  searchLocations(universityId: string, query: LocationSearchQuery): Observable<CampusMap['locations']> {
    const params = new HttpParams({ fromObject: this.removeEmpty(query) });

    return this.http.get<CampusMap['locations']>(
      `${this.baseUrl}/universities/${universityId}/locations`,
      { params }
    );
  }

  getRoute(universityId: string, request: RouteRequest): Observable<RoutePlan> {
    return this.http.post<RoutePlan>(
      `${this.baseUrl}/universities/${universityId}/routes`,
      request
    );
  }

  private removeEmpty(query: LocationSearchQuery): Record<string, string> {
    return Object.fromEntries(
      Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    );
  }
}
