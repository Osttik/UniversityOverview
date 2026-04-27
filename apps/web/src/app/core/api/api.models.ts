export interface ApiCollection<T> {
  items: T[];
  total: number;
}

export interface ApiListResponse<T> {
  data: T[];
  count?: number;
}

export interface ApiItemResponse<T> {
  data: T;
}

export interface University {
  id: string;
  name: string;
  shortName?: string | null;
  description?: string | null;
  status?: 'active' | 'inactive' | 'draft';
  website?: string | null;
  city?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  location?: UniversityLocation;
  contacts?: UniversityContacts | null;
  facultyCount?: number;
  programCount?: number;
  faculties?: Faculty[];
  programs?: StudyProgram[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UniversityLocation {
  country: string;
  city: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UniversityContacts {
  email?: string | null;
  phone?: string | null;
}

export interface Faculty {
  id: string;
  universityId?: string;
  name: string;
  description?: string | null;
  dean?: string | null;
  programCount?: number;
  programs?: StudyProgram[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StudyProgram {
  id: string;
  universityId?: string;
  facultyId?: string;
  facultyName?: string | null;
  name: string;
  degree: string;
  mode?: 'full-time' | 'part-time' | 'online' | 'hybrid';
  durationMonths?: number | null;
  durationYears?: number;
  language?: string | null;
  tuitionPerYear?: number | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UniversitySearchParams {
  search?: string;
  country?: string;
  city?: string;
  program?: string;
  status?: University['status'];
}

export interface ProgramSearchParams {
  facultyId?: string;
}

export type UniversityPayload = Omit<
  University,
  'id' | 'facultyCount' | 'programCount' | 'faculties' | 'programs' | 'createdAt' | 'updatedAt'
>;

export type FacultyPayload = Omit<Faculty, 'id' | 'programCount' | 'programs' | 'createdAt' | 'updatedAt'> & {
  universityId: string;
};

export type StudyProgramPayload = Omit<
  StudyProgram,
  'id' | 'universityId' | 'facultyName' | 'createdAt' | 'updatedAt'
> & {
  facultyId: string;
};
