import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'node:path';
import { JsonFileRepository } from '../common/json-file.repository';
import { CreateUniversityDto, UpdateUniversityDto } from './dto/university.dto';
import { University } from './university.entity';

@Injectable()
export class UniversitiesService {
  private readonly repository = new JsonFileRepository<University>(
    join(__dirname, '..', '..', 'data', 'universities.json'),
  );

  async findAll(): Promise<University[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<University> {
    const university = await this.repository.findById(id);
    if (!university) {
      throw new NotFoundException(`University with id "${id}" was not found`);
    }

    return university;
  }

  async create(dto: CreateUniversityDto): Promise<University> {
    this.assertValidCreateDto(dto);

    return this.repository.create({
      name: dto.name.trim(),
      city: dto.city.trim(),
      country: dto.country.trim(),
      description: dto.description?.trim(),
      website: dto.website?.trim(),
      campuses: dto.campuses ?? [],
      programs: dto.programs ?? [],
    });
  }

  async replace(id: string, dto: CreateUniversityDto): Promise<University> {
    this.assertValidCreateDto(dto);

    const university = await this.repository.replace(id, {
      name: dto.name.trim(),
      city: dto.city.trim(),
      country: dto.country.trim(),
      description: dto.description?.trim(),
      website: dto.website?.trim(),
      campuses: dto.campuses ?? [],
      programs: dto.programs ?? [],
    });

    if (!university) {
      throw new NotFoundException(`University with id "${id}" was not found`);
    }

    return university;
  }

  async update(id: string, dto: UpdateUniversityDto): Promise<University> {
    this.assertValidUpdateDto(dto);

    const university = await this.repository.patch(id, this.normalizeUpdateDto(dto));
    if (!university) {
      throw new NotFoundException(`University with id "${id}" was not found`);
    }

    return university;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`University with id "${id}" was not found`);
    }
  }

  private assertValidCreateDto(dto: CreateUniversityDto): void {
    if (!this.isNonEmptyString(dto?.name)) {
      throw new BadRequestException('name is required');
    }

    if (!this.isNonEmptyString(dto.city)) {
      throw new BadRequestException('city is required');
    }

    if (!this.isNonEmptyString(dto.country)) {
      throw new BadRequestException('country is required');
    }
  }

  private assertValidUpdateDto(dto: UpdateUniversityDto): void {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('at least one field is required');
    }

    for (const field of ['name', 'city', 'country'] as const) {
      if (field in dto && !this.isNonEmptyString(dto[field])) {
        throw new BadRequestException(`${field} must be a non-empty string`);
      }
    }
  }

  private normalizeUpdateDto(dto: UpdateUniversityDto): UpdateUniversityDto {
    const normalized: UpdateUniversityDto = {};

    if (dto.name !== undefined) {
      normalized.name = dto.name.trim();
    }

    if (dto.city !== undefined) {
      normalized.city = dto.city.trim();
    }

    if (dto.country !== undefined) {
      normalized.country = dto.country.trim();
    }

    if (dto.description !== undefined) {
      normalized.description = dto.description.trim();
    }

    if (dto.website !== undefined) {
      normalized.website = dto.website.trim();
    }

    if (dto.campuses !== undefined) {
      normalized.campuses = dto.campuses;
    }

    if (dto.programs !== undefined) {
      normalized.programs = dto.programs;
    }

    return normalized;
  }

  private isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }
}
