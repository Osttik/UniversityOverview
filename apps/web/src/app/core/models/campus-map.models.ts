import type {
  CampusLocationType,
  GetCampusMapResponse,
  GetRouteResponse,
  SearchCampusLocationsResponse
} from '@university-overview/shared';

export type {
  CampusLocation,
  CampusLocationType,
  CampusMap,
  MapPoint,
  RoutePlan,
  RouteRequest,
  RouteStep
} from '@university-overview/shared';

export type CampusLocationResultsResponse = SearchCampusLocationsResponse;
export type CampusMapResponse = GetCampusMapResponse;
export type CampusRouteResponse = GetRouteResponse;

export interface LocationSearchQuery {
  search?: string;
  type?: CampusLocationType;
  floor?: string;
}
