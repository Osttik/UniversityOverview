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

export interface LocationSearchQuery {
  search?: string;
  type?: CampusLocationType;
  floor?: string;
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
