import { Controller, Get, Param, Query } from '@nestjs/common';
import { UniversitiesService } from './universities.service';

@Controller('api/universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  findAll(@Query() query: Record<string, string | undefined>) {
    return this.universitiesService.findAll(query);
  }

  @Get('filters')
  filters() {
    return this.universitiesService.filters();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.universitiesService.findOne(id);
  }
}
