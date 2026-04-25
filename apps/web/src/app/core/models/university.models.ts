import type {
  GetUniversityResponse,
  ListUniversitiesResponse,
  ListUniversityProgramsResponse
} from '@university-overview/shared';

export type ApiUniversity = GetUniversityResponse;
export type UniversityDetail = GetUniversityResponse;
export type UniversityListResponse = ListUniversitiesResponse;
export type UniversityProgram = ListUniversityProgramsResponse[number];
export type UniversityProgramsResponse = ListUniversityProgramsResponse;

export interface UniversitySummary {
  id: string;
  name: string;
  city: string;
  country: string;
  logoUrl?: string;
  campusesCount: number;
  programsCount: number;
  rating?: number;
}

export interface Campus {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
}

export interface UniversitySearchQuery {
  search?: string;
  city?: string;
  country?: string;
  degree?: string;
}

export interface ProgramSearchQuery {
  search?: string;
  degree?: string;
  faculty?: string;
  language?: string;
}
