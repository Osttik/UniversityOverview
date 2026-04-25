import { Controller, Get } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import type { University } from '@university-overview/shared';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  findAll(): University[] {
    return this.universitiesService.findAll();
  }
}
