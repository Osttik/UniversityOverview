export interface University {
  id: string;
  name: string;
  city: string;
  status: 'active' | 'review' | 'archived';
  programs: number;
  applicants: number;
  updatedAt: string;
}

export interface MapPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: 'building' | 'office' | 'landmark';
}
