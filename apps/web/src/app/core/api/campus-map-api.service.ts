import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api-base-url.token';
import {
  CampusLocationResultsResponse,
  LocationSearchQuery,
  CampusMapResponse,
  CampusRouteResponse,
  RouteRequest
} from '../models/campus-map.models';

@Injectable({ providedIn: 'root' })
export class CampusMapApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getCampusMap(universityId: string): Observable<CampusMapResponse> {
    return this.http.get<CampusMapResponse>(`${this.baseUrl}/universities/${universityId}/map`);
  }

  searchLocations(
    universityId: string,
    query: LocationSearchQuery
  ): Observable<CampusLocationResultsResponse> {
    const params = new HttpParams({ fromObject: this.removeEmpty(query) });

    return this.http.get<CampusLocationResultsResponse>(
      `${this.baseUrl}/universities/${universityId}/locations`,
      { params }
    );
  }

  getRoute(universityId: string, request: RouteRequest): Observable<CampusRouteResponse> {
    return this.http.post<CampusRouteResponse>(
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
