import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  LocationSearchQuery,
  ProgramSearchQuery,
  UniversitiesService,
  UniversitySearchQuery
} from './universities.service';
import type {
  GetCampusMapResponse,
  GetRouteResponse,
  GetUniversityResponse,
  ListUniversitiesResponse,
  ListUniversityProgramsResponse,
  RouteRequest,
  SearchCampusLocationsResponse
} from '@university-overview/shared';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  findAll(@Query() query: UniversitySearchQuery): ListUniversitiesResponse {
    return this.universitiesService.findAll(query);
  }

  @Get(':id/programs')
  listPrograms(
    @Param('id') id: string,
    @Query() query: ProgramSearchQuery
  ): ListUniversityProgramsResponse {
    return this.universitiesService.listPrograms(id, query);
  }

  @Get(':id/map')
  getCampusMap(@Param('id') id: string): GetCampusMapResponse {
    return this.universitiesService.getCampusMap(id);
  }

  @Get(':id/locations')
  searchLocations(
    @Param('id') id: string,
    @Query() query: LocationSearchQuery
  ): SearchCampusLocationsResponse {
    return this.universitiesService.searchLocations(id, query);
  }

  @Post(':id/routes')
  getRoute(@Param('id') id: string, @Body() request: RouteRequest): GetRouteResponse {
    return this.universitiesService.getRoute(id, request);
  }

  @Get(':id')
  findOne(@Param('id') id: string): GetUniversityResponse {
    return this.universitiesService.findOne(id);
  }
}
