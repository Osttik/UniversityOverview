import { Controller, Get } from '@nestjs/common';
import { UniversitiesService, UniversityOverview } from './universities.service';

@Controller('api/universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  async list(): Promise<UniversityOverview[]> {
    return this.universitiesService.list();
  }
}
