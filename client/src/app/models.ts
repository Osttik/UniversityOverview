export interface CampusLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  hours: string;
  services: string[];
  transport: string;
}

export interface University {
  id: string;
  name: string;
  type: string;
  city: string;
  region: string;
  rating: number;
  hasAccommodation: boolean;
  programLevels: string[];
  tuitionFrom: number;
  tuitionTo: number;
  summary: string;
  locations: CampusLocation[];
}

export interface UniversityFilters {
  cities: string[];
  regions: string[];
  types: string[];
  programLevels: string[];
  maxTuition: number;
}

export interface SearchState {
  query: string;
  city: string;
  region: string;
  type: string;
  programLevel: string;
  hasAccommodation: boolean;
  maxTuition: number;
}
