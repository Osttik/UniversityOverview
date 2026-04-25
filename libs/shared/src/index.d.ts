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

export type CampusLocationType =
  | 'building'
  | 'auditorium'
  | 'faculty'
  | 'service'
  | 'entrance'
  | 'transport';

export interface MapPoint {
  x: number;
  y: number;
}

export interface CampusLocation {
  id: string;
  name: string;
  type: CampusLocationType;
  buildingCode?: string;
  floor?: string;
  tags: string[];
  coordinates: MapPoint;
}

export interface CampusMap {
  universityId: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  locations: CampusLocation[];
  updatedAt: string;
}

export interface RouteRequest {
  fromLocationId: string;
  toLocationId: string;
  accessibleOnly?: boolean;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  start: MapPoint;
  end: MapPoint;
}

export interface RoutePlan {
  universityId: string;
  totalDistanceMeters: number;
  estimatedMinutes: number;
  steps: RouteStep[];
}
