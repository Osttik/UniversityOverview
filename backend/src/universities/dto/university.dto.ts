import { UniversityCampus, UniversityProgram } from '../university.entity';

export interface CreateUniversityDto {
  name: string;
  city: string;
  country: string;
  description?: string;
  website?: string;
  campuses?: UniversityCampus[];
  programs?: UniversityProgram[];
}

export type UpdateUniversityDto = Partial<CreateUniversityDto>;
