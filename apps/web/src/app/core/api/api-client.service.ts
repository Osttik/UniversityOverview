import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api.tokens';

export type ApiQueryValue = string | number | boolean | null | undefined;
export type ApiQueryParams = object;

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = normalizeBaseUrl(inject(API_BASE_URL));

  get<T>(path: string, query?: ApiQueryParams): Observable<T> {
    return this.http.get<T>(this.url(path), { params: toHttpParams(query) });
  }

  post<TResponse, TBody = unknown>(path: string, body: TBody, query?: ApiQueryParams): Observable<TResponse> {
    return this.http.post<TResponse>(this.url(path), body, { params: toHttpParams(query) });
  }

  put<TResponse, TBody = unknown>(path: string, body: TBody, query?: ApiQueryParams): Observable<TResponse> {
    return this.http.put<TResponse>(this.url(path), body, { params: toHttpParams(query) });
  }

  patch<TResponse, TBody = unknown>(path: string, body: TBody, query?: ApiQueryParams): Observable<TResponse> {
    return this.http.patch<TResponse>(this.url(path), body, { params: toHttpParams(query) });
  }

  delete<T>(path: string, query?: ApiQueryParams): Observable<T> {
    return this.http.delete<T>(this.url(path), { params: toHttpParams(query) });
  }

  private url(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseUrl}/${cleanPath}`;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function toHttpParams(query?: ApiQueryParams): HttpParams {
  let params = new HttpParams();

  if (!query) {
    return params;
  }

  for (const [key, value] of Object.entries(query as Record<string, ApiQueryValue | readonly ApiQueryValue[]>)) {
    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      if (item !== null && item !== undefined && item !== '') {
        params = params.append(key, String(item));
      }
    }
  }

  return params;
}
