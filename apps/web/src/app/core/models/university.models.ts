import { CampusLocation } from './campus-map.models';

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

export interface UniversityDetail extends UniversitySummary {
  description: string;
  websiteUrl?: string;
  admissionsEmail?: string;
  phone?: string;
  campuses: Campus[];
  programs: UniversityProgram[];
}

export interface Campus {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  locations: CampusLocation[];
}

export interface UniversityProgram {
  id: string;
  universityId: string;
  name: string;
  degree: 'bachelor' | 'master' | 'phd' | 'certificate';
  faculty: string;
  durationMonths: number;
  language: string;
  tuitionPerYear?: number;
}

export interface UniversitySearchQuery {
  search?: string;
  city?: string;
  country?: string;
  degree?: UniversityProgram['degree'];
}

export interface ProgramSearchQuery {
  search?: string;
  degree?: UniversityProgram['degree'];
  faculty?: string;
  language?: string;
}
