export interface UniversityContact {
  email: string;
  phone: string;
}

export interface UniversityCoordinates {
  latitude: number;
  longitude: number;
}

export interface UniversityImageAsset {
  src: string;
  alt: string;
  legacySource?: string;
}

export interface UniversityImages {
  brand?: UniversityImageAsset;
  campusMap?: UniversityImageAsset;
}

export interface UniversityProgram {
  id: string;
  title: string;
  degree: string;
  faculty: string;
  durationYears: number;
  language: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  address: string;
  summary: string;
  programs: number;
  students: number;
  faculties: number;
  website: string;
  contacts: UniversityContact;
  coordinates: UniversityCoordinates;
  images: UniversityImages;
  featuredPrograms: UniversityProgram[];
}
