import { JsonEntity } from '../common/json-file.repository';

export interface UniversityCampus {
  id: string;
  name: string;
  address: string;
  mapImage?: string;
}

export interface UniversityProgram {
  id: string;
  name: string;
  degree: string;
  durationYears: number;
}

export interface University extends JsonEntity {
  name: string;
  city: string;
  country: string;
  description?: string;
  website?: string;
  campuses: UniversityCampus[];
  programs: UniversityProgram[];
}
