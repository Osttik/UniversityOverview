import { Injectable, NotFoundException } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { University, UniversityFilters } from './types';

interface SearchParams {
  query?: string;
  city?: string;
  region?: string;
  type?: string;
  programLevel?: string;
  hasAccommodation?: string;
  maxTuition?: string;
}

@Injectable()
export class UniversitiesService {
  private readonly universities: University[] = this.loadUniversities();

  findAll(params: SearchParams): University[] {
    const query = this.normalize(params.query);
    const city = this.normalize(params.city);
    const region = this.normalize(params.region);
    const type = this.normalize(params.type);
    const programLevel = this.normalize(params.programLevel);
    const requireAccommodation = params.hasAccommodation === 'true';
    const maxTuition = Number(params.maxTuition);

    return this.universities
      .filter((university) => {
        const searchable = [
          university.name,
          university.city,
          university.region,
          university.type,
          university.summary,
          ...university.programLevels,
          ...university.locations.flatMap((location) => [
            location.name,
            location.address,
            ...location.services
          ])
        ].join(' ');

        if (query && !this.normalize(searchable).includes(query)) {
          return false;
        }

        if (city && this.normalize(university.city) !== city) {
          return false;
        }

        if (region && this.normalize(university.region) !== region) {
          return false;
        }

        if (type && this.normalize(university.type) !== type) {
          return false;
        }

        if (
          programLevel &&
          !university.programLevels.some((level) => this.normalize(level) === programLevel)
        ) {
          return false;
        }

        if (requireAccommodation && !university.hasAccommodation) {
          return false;
        }

        if (Number.isFinite(maxTuition) && university.tuitionFrom > maxTuition) {
          return false;
        }

        return true;
      })
      .sort((first, second) => second.rating - first.rating || first.name.localeCompare(second.name));
  }

  findOne(id: string): University {
    const university = this.universities.find((item) => item.id === id);

    if (!university) {
      throw new NotFoundException(`University ${id} was not found`);
    }

    return university;
  }

  filters(): UniversityFilters {
    return {
      cities: this.unique((university) => university.city),
      regions: this.unique((university) => university.region),
      types: this.unique((university) => university.type),
      programLevels: Array.from(
        new Set(this.universities.flatMap((university) => university.programLevels))
      ).sort(),
      maxTuition: Math.max(...this.universities.map((university) => university.tuitionTo))
    };
  }

  private loadUniversities(): University[] {
    const dataPath = join(process.cwd(), 'server', 'data', 'universities.json');
    const raw = readFileSync(dataPath, 'utf8');

    return JSON.parse(raw) as University[];
  }

  private unique(selector: (university: University) => string): string[] {
    return Array.from(new Set(this.universities.map(selector))).sort();
  }

  private normalize(value: string | undefined): string {
    return (value ?? '').trim().toLocaleLowerCase();
  }
}
