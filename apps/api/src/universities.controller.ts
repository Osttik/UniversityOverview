import { Controller, Get, Param, Query } from '@nestjs/common';
import type { University, UniversitySummary } from './university';
import { UniversitiesService } from './universities.service';

@Controller()
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get('universities')
  findAll(@Query('q') query?: string, @Query('category') category?: string): Promise<University[]> {
    return this.universitiesService.findAll(query, category);
  }

  @Get('universities/:id')
  findOne(@Param('id') id: string): Promise<University> {
    return this.universitiesService.findOne(id);
  }

  @Get('summary')
  getSummary(): Promise<UniversitySummary> {
    return this.universitiesService.getSummary();
  }
}
