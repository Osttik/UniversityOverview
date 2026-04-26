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
  updatedAt?: string;
}

export interface ApiListResponse<T> {
  data: T[];
}

export interface MapPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: 'building' | 'office' | 'landmark';
}
