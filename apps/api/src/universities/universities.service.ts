import { Injectable, NotFoundException } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  CampusLocation,
  CampusMap,
  RoutePlan,
  RouteRequest,
  University,
  UniversityProgram
} from '@university-overview/shared';

export interface UniversitySearchQuery {
  search?: string;
  city?: string;
  country?: string;
  degree?: string;
}

export interface ProgramSearchQuery {
  search?: string;
  degree?: string;
  faculty?: string;
  language?: string;
}

export interface LocationSearchQuery {
  search?: string;
  type?: CampusLocation['type'];
  floor?: string;
}

@Injectable()
export class UniversitiesService {
  private readonly dataPath = join(process.cwd(), 'apps', 'api', 'data', 'universities.json');

  findAll(query: UniversitySearchQuery = {}): University[] {
    const raw = readFileSync(this.dataPath, 'utf8');
    const universities = JSON.parse(raw) as University[];
    const normalizedSearch = this.normalize(query.search);
    const normalizedCity = this.normalize(query.city);
    const normalizedCountry = this.normalize(query.country);
    const normalizedDegree = this.normalize(query.degree);

    return universities.filter((university) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          university.name,
          university.shortName,
          university.city,
          university.country,
          university.summary,
          university.address
        ].some((value) => this.normalize(value).includes(normalizedSearch));

      const matchesCity = !normalizedCity || this.normalize(university.city) === normalizedCity;
      const matchesCountry =
        !normalizedCountry || this.normalize(university.country) === normalizedCountry;
      const matchesDegree =
        !normalizedDegree ||
        university.featuredPrograms.some(
          (program) => this.normalize(program.degree) === normalizedDegree
        );

      return matchesSearch && matchesCity && matchesCountry && matchesDegree;
    });
  }

  findOne(id: string): University {
    const university = this.readAll().find((candidate) => candidate.id === id);
    if (!university) {
      throw new NotFoundException(`University with id "${id}" was not found`);
    }

    return university;
  }

  listPrograms(id: string, query: ProgramSearchQuery = {}): UniversityProgram[] {
    const university = this.findOne(id);
    const normalizedSearch = this.normalize(query.search);
    const normalizedDegree = this.normalize(query.degree);
    const normalizedFaculty = this.normalize(query.faculty);
    const normalizedLanguage = this.normalize(query.language);

    return university.featuredPrograms.filter((program) => {
      const matchesSearch =
        !normalizedSearch ||
        [program.title, program.degree, program.faculty, program.language].some((value) =>
          this.normalize(value).includes(normalizedSearch)
        );
      const matchesDegree = !normalizedDegree || this.normalize(program.degree) === normalizedDegree;
      const matchesFaculty =
        !normalizedFaculty || this.normalize(program.faculty).includes(normalizedFaculty);
      const matchesLanguage =
        !normalizedLanguage || this.normalize(program.language) === normalizedLanguage;

      return matchesSearch && matchesDegree && matchesFaculty && matchesLanguage;
    });
  }

  getCampusMap(id: string): CampusMap {
    return this.toCampusMap(this.findOne(id));
  }

  searchLocations(id: string, query: LocationSearchQuery = {}): CampusLocation[] {
    const locations = this.getCampusMap(id).locations;
    const normalizedSearch = this.normalize(query.search);
    const normalizedType = this.normalize(query.type);
    const normalizedFloor = this.normalize(query.floor);

    return locations.filter((location) => {
      const matchesSearch =
        !normalizedSearch ||
        [location.name, location.buildingCode, location.floor, ...location.tags].some((value) =>
          this.normalize(value).includes(normalizedSearch)
        );
      const matchesType = !normalizedType || this.normalize(location.type) === normalizedType;
      const matchesFloor = !normalizedFloor || this.normalize(location.floor) === normalizedFloor;

      return matchesSearch && matchesType && matchesFloor;
    });
  }

  getRoute(id: string, request: RouteRequest): RoutePlan {
    const campusMap = this.getCampusMap(id);
    const from = campusMap.locations.find((location) => location.id === request.fromLocationId);
    const to = campusMap.locations.find((location) => location.id === request.toLocationId);

    if (!from || !to) {
      throw new NotFoundException('Route endpoint locations were not found');
    }

    const totalDistanceMeters = Math.round(
      Math.hypot(to.coordinates.x - from.coordinates.x, to.coordinates.y - from.coordinates.y) * 9
    );

    return {
      universityId: id,
      totalDistanceMeters,
      estimatedMinutes: Math.max(1, Math.ceil(totalDistanceMeters / 80)),
      steps: [
        {
          instruction: request.accessibleOnly
            ? `Take the accessible route from ${from.name} to ${to.name}.`
            : `Walk from ${from.name} to ${to.name}.`,
          distanceMeters: totalDistanceMeters,
          start: from.coordinates,
          end: to.coordinates
        }
      ]
    };
  }

  private readAll(): University[] {
    const raw = readFileSync(this.dataPath, 'utf8');
    return JSON.parse(raw) as University[];
  }

  private toCampusMap(university: University): CampusMap {
    const brandLocation: CampusLocation = {
      id: `${university.id}-main-building`,
      name: `${university.shortName} main building`,
      type: 'building',
      buildingCode: university.shortName,
      floor: '1',
      tags: ['Admissions', university.city],
      coordinates: { x: 28, y: 42 }
    };

    const facultyLocation: CampusLocation = {
      id: `${university.id}-faculty-office`,
      name: `${university.shortName} faculty office`,
      type: 'faculty',
      buildingCode: university.shortName,
      floor: '2',
      tags: university.featuredPrograms.map((program) => program.faculty),
      coordinates: { x: 64, y: 58 }
    };

    const transportLocation: CampusLocation = {
      id: `${university.id}-transport`,
      name: `${university.city} transit connection`,
      type: 'transport',
      tags: ['Transit', university.address],
      coordinates: { x: 14, y: 76 }
    };

    return {
      universityId: university.id,
      name: `${university.shortName} campus map`,
      imageUrl: university.images.campusMap?.src ?? university.images.brand?.src ?? '',
      width: 1200,
      height: 760,
      locations: [brandLocation, facultyLocation, transportLocation],
      updatedAt: '2026-04-25T00:00:00.000Z'
    };
  }

  private normalize(value: unknown): string {
    return String(value ?? '').trim().toLowerCase();
  }
}
