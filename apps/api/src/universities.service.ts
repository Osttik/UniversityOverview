import { Injectable, NotFoundException } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { University, UniversitySummary } from './university';

@Injectable()
export class UniversitiesService {
  private readonly dataPath = process.env['UNIVERSITY_DATA_PATH'] ?? join(process.cwd(), 'apps', 'api', 'data', 'universities.json');

  async findAll(query?: string, category?: string): Promise<University[]> {
    const universities = await this.loadUniversities();
    const normalizedQuery = query?.trim().toLowerCase();
    const normalizedCategory = category?.trim().toLowerCase();

    return universities.filter((university) => {
      const matchesQuery = !normalizedQuery || [
        university.name,
        university.city,
        university.region,
        ...university.programs,
        ...university.highlights,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));

      const matchesCategory = !normalizedCategory || university.categories.some((item) => item.toLowerCase() === normalizedCategory);

      return matchesQuery && matchesCategory;
    });
  }

  async findOne(id: string): Promise<University> {
    const university = (await this.loadUniversities()).find((item) => item.id === id);

    if (!university) {
      throw new NotFoundException(`University '${id}' was not found`);
    }

    return university;
  }

  async getSummary(): Promise<UniversitySummary> {
    const universities = await this.loadUniversities();
    const totalStudents = universities.reduce((sum, university) => sum + university.students, 0);
    const averageRating = universities.reduce((sum, university) => sum + university.rating, 0) / universities.length;

    return {
      totalUniversities: universities.length,
      totalStudents,
      averageRating: Number(averageRating.toFixed(1)),
      regions: [...new Set(universities.map((university) => university.region))].sort(),
      categories: [...new Set(universities.flatMap((university) => university.categories))].sort(),
    };
  }

  private async loadUniversities(): Promise<University[]> {
    const raw = await readFile(this.dataPath, 'utf8');
    return JSON.parse(raw) as University[];
  }
}
