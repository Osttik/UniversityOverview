import type { CampusLocationType } from '@university-overview/shared';

export type {
  CampusLocation,
  CampusLocationType,
  CampusMap,
  MapPoint,
  RoutePlan,
  RouteRequest,
  RouteStep
} from '@university-overview/shared';

export interface LocationSearchQuery {
  search?: string;
  type?: CampusLocationType;
  floor?: string;
}
