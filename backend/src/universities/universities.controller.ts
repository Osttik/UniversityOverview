import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put } from '@nestjs/common';
import { CreateUniversityDto, UpdateUniversityDto } from './dto/university.dto';
import { UniversitiesService } from './universities.service';
import { University } from './university.entity';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  findAll(): Promise<University[]> {
    return this.universitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<University> {
    return this.universitiesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUniversityDto): Promise<University> {
    return this.universitiesService.create(dto);
  }

  @Put(':id')
  replace(@Param('id') id: string, @Body() dto: CreateUniversityDto): Promise<University> {
    return this.universitiesService.replace(id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUniversityDto): Promise<University> {
    return this.universitiesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.universitiesService.remove(id);
  }
}
