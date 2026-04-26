export interface University {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  country: string;
  students: number;
  programs: string[] | Program[];
  founded: number;
  type?: string;
  website?: string;
  description?: string;
  counts?: {
    campuses: number;
    faculties: number;
    programs: number;
  };
  campuses?: Campus[];
  faculties?: Faculty[];
  updatedAt?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface MapPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: 'building' | 'office' | 'landmark';
}

export interface Faculty {
  id: string;
  universityId: string;
  name: string;
  shortName: string;
  description: string;
  programIds: string[];
  university?: UniversitySummary | null;
}

export interface Campus {
  id: string;
  universityId: string;
  name: string;
  city: string;
  country: string;
  address: string;
  facilities: string[];
  description?: string;
  university?: UniversitySummary | null;
}

export interface Tuition {
  amount: number;
  currency: string;
}

export interface Program {
  id: string;
  universityId: string;
  facultyId: string;
  campusId: string;
  name: string;
  degree: string;
  field: string;
  durationYears: number;
  language: string;
  studyMode: string;
  tuitionPerYear?: Tuition;
  tags: string[];
  description?: string;
  university?: UniversitySummary | null;
  faculty?: FacultySummary | null;
  campus?: CampusSummary | null;
}

export interface UniversitySummary {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  country: string;
  type?: string;
}

export interface FacultySummary {
  id: string;
  universityId: string;
  name: string;
  shortName: string;
}

export interface CampusSummary {
  id: string;
  universityId: string;
  name: string;
  city: string;
  country: string;
  address: string;
}

export interface CatalogFilters {
  cities: string[];
  countries: string[];
  degrees: string[];
  fields: string[];
  languages: string[];
  studyModes: string[];
  universityTypes: string[];
  universities: UniversitySummary[];
  faculties: FacultySummary[];
}
