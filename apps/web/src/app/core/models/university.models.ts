import type {
  University,
  UniversityProgram as ApiUniversityProgram
} from '@university-overview/shared';

export type ApiUniversity = University;
export type UniversityDetail = University;
export type UniversityProgram = ApiUniversityProgram;

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
