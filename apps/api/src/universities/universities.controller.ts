import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  LocationSearchQuery,
  ProgramSearchQuery,
  UniversitiesService,
  UniversitySearchQuery
} from './universities.service';
import type {
  CampusLocation,
  CampusMap,
  RoutePlan,
  RouteRequest,
  University,
  UniversityProgram
} from '@university-overview/shared';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  findAll(@Query() query: UniversitySearchQuery): University[] {
    return this.universitiesService.findAll(query);
  }

  @Get(':id/programs')
  listPrograms(
    @Param('id') id: string,
    @Query() query: ProgramSearchQuery
  ): UniversityProgram[] {
    return this.universitiesService.listPrograms(id, query);
  }

  @Get(':id/map')
  getCampusMap(@Param('id') id: string): CampusMap {
    return this.universitiesService.getCampusMap(id);
  }

  @Get(':id/locations')
  searchLocations(
    @Param('id') id: string,
    @Query() query: LocationSearchQuery
  ): CampusLocation[] {
    return this.universitiesService.searchLocations(id, query);
  }

  @Post(':id/routes')
  getRoute(@Param('id') id: string, @Body() request: RouteRequest): RoutePlan {
    return this.universitiesService.getRoute(id, request);
  }

  @Get(':id')
  findOne(@Param('id') id: string): University {
    return this.universitiesService.findOne(id);
  }
}
