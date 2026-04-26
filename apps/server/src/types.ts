export interface University {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  country: string;
  students: number;
  programs: string[];
  founded: number;
  type?: string;
  website?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Faculty {
  id: string;
  universityId: string;
  name: string;
  shortName: string;
  description: string;
  programIds: string[];
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
}

export interface CampusMapImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface CampusMapMarker {
  id: string;
  name: string;
  type: string;
  description: string;
  x: number;
  y: number;
  campusId?: string;
}

export interface CampusMap {
  name: string;
  image: CampusMapImage;
  markers: CampusMapMarker[];
}
