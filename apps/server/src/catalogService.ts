import path from "node:path";
import { readJsonFile } from "./storage/jsonFile.js";
import type { Campus, Faculty, Program, University } from "./types.js";

type QueryValue = string | string[] | undefined;
type CatalogQuery = Record<string, QueryValue>;
type EntityName = "campuses" | "faculties" | "programs" | "universities";

interface Catalog {
  campuses: Campus[];
  faculties: Faculty[];
  programs: Program[];
  universities: University[];
}

interface Page<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

const entityFiles: Record<EntityName, string> = {
  campuses: "campuses.json",
  faculties: "faculties.json",
  programs: "programs.json",
  universities: "universities.json"
};

const searchableKeys = [
  "name",
  "shortName",
  "city",
  "country",
  "description",
  "degree",
  "field",
  "language",
  "studyMode",
  "type"
] as const;

export class CatalogService {
  constructor(private readonly dataDir: string) {}

  async listUniversities(query: CatalogQuery = {}) {
    const catalog = await this.loadCatalog();
    const q = normalize(firstQueryValue(query.q) ?? firstQueryValue(query.search));
    const filtered = catalog.universities.filter(
      (university) =>
        matchesQuery(university, q) &&
        matchesExact(university.city, query.city) &&
        matchesExact(university.country, query.country) &&
        matchesExact(university.type, query.type)
    );

    return paginate(
      sortUniversities(query)(filtered.map((university) => ({
        ...university,
        counts: {
          campuses: catalog.campuses.filter((campus) => campus.universityId === university.id).length,
          faculties: catalog.faculties.filter((faculty) => faculty.universityId === university.id).length,
          programs: catalog.programs.filter((program) => program.universityId === university.id).length
        }
      }))),
      query
    );
  }

  async getUniversityDetail(id: string) {
    const catalog = await this.loadCatalog();
    const university = catalog.universities.find((item) => item.id === id);

    if (!university) {
      return null;
    }

    return {
      ...university,
      campuses: catalog.campuses.filter((campus) => campus.universityId === id),
      faculties: catalog.faculties.filter((faculty) => faculty.universityId === id),
      programs: catalog.programs
        .filter((program) => program.universityId === id)
        .map((program) => enrichProgram(program, catalog))
    };
  }

  async listFaculties(query: CatalogQuery = {}) {
    const catalog = await this.loadCatalog();
    const q = normalize(firstQueryValue(query.q) ?? firstQueryValue(query.search));
    const filtered = catalog.faculties.filter(
      (faculty) => matchesQuery(faculty, q) && matchesExact(faculty.universityId, query.universityId)
    );

    return paginate(
      filtered.map((faculty) => ({
        ...faculty,
        university: toUniversitySummary(catalog.universities.find((item) => item.id === faculty.universityId)),
        programs: catalog.programs.filter((program) => faculty.programIds.includes(program.id)).map(toProgramSummary)
      })),
      query
    );
  }

  async getFacultyDetail(id: string) {
    const catalog = await this.loadCatalog();
    const faculty = catalog.faculties.find((item) => item.id === id);

    if (!faculty) {
      return null;
    }

    return {
      ...faculty,
      university: catalog.universities.find((item) => item.id === faculty.universityId) ?? null,
      programs: catalog.programs
        .filter((program) => program.facultyId === id)
        .map((program) => enrichProgram(program, catalog))
    };
  }

  async listCampuses(query: CatalogQuery = {}) {
    const catalog = await this.loadCatalog();
    const q = normalize(firstQueryValue(query.q) ?? firstQueryValue(query.search));
    const filtered = catalog.campuses.filter(
      (campus) =>
        matchesQuery(campus, q) &&
        matchesExact(campus.universityId, query.universityId) &&
        matchesExact(campus.city, query.city)
    );

    return paginate(
      filtered.map((campus) => ({
        ...campus,
        university: toUniversitySummary(catalog.universities.find((item) => item.id === campus.universityId))
      })),
      query
    );
  }

  async getCampusDetail(id: string) {
    const catalog = await this.loadCatalog();
    const campus = catalog.campuses.find((item) => item.id === id);

    if (!campus) {
      return null;
    }

    return {
      ...campus,
      university: catalog.universities.find((item) => item.id === campus.universityId) ?? null,
      programs: catalog.programs
        .filter((program) => program.campusId === id)
        .map((program) => enrichProgram(program, catalog))
    };
  }

  async listPrograms(query: CatalogQuery = {}) {
    const catalog = await this.loadCatalog();
    const q = normalize(firstQueryValue(query.q) ?? firstQueryValue(query.search));
    const maxTuition = toPositiveNumber(query.maxTuition);
    const filtered = catalog.programs.filter((program) => {
      const campus = catalog.campuses.find((item) => item.id === program.campusId);

      return (
        matchesQuery(program, q) &&
        matchesExact(program.universityId, query.universityId) &&
        matchesExact(program.facultyId, query.facultyId) &&
        matchesExact(program.campusId, query.campusId) &&
        matchesExact(program.degree, query.degree) &&
        matchesExact(program.field, query.field) &&
        matchesExact(program.language, query.language) &&
        matchesExact(program.studyMode, query.studyMode ?? query.mode) &&
        matchesExact(campus?.city, query.city) &&
        (maxTuition === undefined || (program.tuitionPerYear?.amount ?? Number.POSITIVE_INFINITY) <= maxTuition)
      );
    });

    return paginate(sortPrograms(filtered.map((program) => enrichProgram(program, catalog)), query), query);
  }

  async getProgramDetail(id: string) {
    const catalog = await this.loadCatalog();
    const program = catalog.programs.find((item) => item.id === id);
    return program ? enrichProgram(program, catalog) : null;
  }

  async getFilters() {
    const catalog = await this.loadCatalog();

    return {
      data: {
        cities: uniqueSorted(catalog.universities.map((item) => item.city).concat(catalog.campuses.map((item) => item.city))),
        countries: uniqueSorted(catalog.universities.map((item) => item.country)),
        degrees: uniqueSorted(catalog.programs.map((item) => item.degree)),
        fields: uniqueSorted(catalog.programs.map((item) => item.field)),
        languages: uniqueSorted(catalog.programs.map((item) => item.language)),
        studyModes: uniqueSorted(catalog.programs.map((item) => item.studyMode)),
        universityTypes: uniqueSorted(catalog.universities.map((item) => item.type)),
        universities: catalog.universities.map(toUniversitySummary),
        faculties: catalog.faculties.map(toFacultySummary)
      }
    };
  }

  async searchCatalog(query: CatalogQuery = {}) {
    const q = normalize(firstQueryValue(query.q) ?? firstQueryValue(query.search));

    if (!q) {
      return {
        data: {
          universities: [],
          faculties: [],
          campuses: [],
          programs: []
        },
        meta: {
          total: 0,
          query: ""
        }
      };
    }

    const catalog = await this.loadCatalog();
    const universities = catalog.universities.filter((item) => matchesQuery(item, q));
    const faculties = catalog.faculties.filter((item) => matchesQuery(item, q));
    const campuses = catalog.campuses.filter((item) => matchesQuery(item, q));
    const programs = catalog.programs.filter((item) => matchesQuery(item, q)).map((program) => enrichProgram(program, catalog));

    return {
      data: {
        universities,
        faculties,
        campuses,
        programs
      },
      meta: {
        total: universities.length + faculties.length + campuses.length + programs.length,
        query: q
      }
    };
  }

  async getDetail(entity: string, id: string) {
    switch (normalize(entity)) {
      case "campus":
      case "campuses":
        return this.getCampusDetail(id);
      case "faculty":
      case "faculties":
        return this.getFacultyDetail(id);
      case "program":
      case "programs":
        return this.getProgramDetail(id);
      case "university":
      case "universities":
        return this.getUniversityDetail(id);
      default:
        return null;
    }
  }

  private async loadCatalog(): Promise<Catalog> {
    const [universities, faculties, campuses, programs] = await Promise.all([
      this.readCollection<University>("universities"),
      this.readCollection<Faculty>("faculties"),
      this.readCollection<Campus>("campuses"),
      this.readCollection<Program>("programs")
    ]);

    return {
      campuses,
      faculties,
      programs,
      universities
    };
  }

  private readCollection<T>(entity: EntityName): Promise<T[]> {
    return readJsonFile<T[]>(path.join(this.dataDir, entityFiles[entity]), []);
  }
}

function paginate<T>(items: T[], query: CatalogQuery): Page<T> {
  const page = Math.max(toPositiveInteger(query.page) ?? 1, 1);
  const limit = Math.min(Math.max(toPositiveInteger(query.limit) ?? items.length, 1), 100);
  const start = (page - 1) * limit;

  return {
    data: items.slice(start, start + limit),
    meta: {
      total: items.length,
      page,
      limit
    }
  };
}

function firstQueryValue(value: QueryValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function toPositiveInteger(value: QueryValue): number | undefined {
  const parsed = Number(firstQueryValue(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function toPositiveNumber(value: QueryValue): number | undefined {
  const parsed = Number(firstQueryValue(value));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function matchesQuery(item: object, query: string): boolean {
  if (!query) {
    return true;
  }

  const record = item as Record<string, unknown>;
  return (
    searchableKeys.some((key) => valueIncludes(record[key], query)) ||
    (Array.isArray(record.tags) && record.tags.some((tag) => valueIncludes(tag, query))) ||
    (Array.isArray(record.programs) && record.programs.some((program) => valueIncludes(program, query))) ||
    (Array.isArray(record.facilities) && record.facilities.some((facility) => valueIncludes(facility, query)))
  );
}

function matchesExact(value: unknown, expected: QueryValue): boolean {
  const expectedValue = firstQueryValue(expected);
  return !expectedValue || normalize(value) === normalize(expectedValue);
}

function valueIncludes(value: unknown, query: string): boolean {
  return normalize(value).includes(query);
}

function uniqueSorted(values: unknown[]): string[] {
  return [...new Set(values.filter(Boolean).map(String))].sort((a, b) => a.localeCompare(b));
}

function sortUniversities<T extends University & { counts?: { programs: number } }>(query: CatalogQuery) {
  return (items: T[]) => {
    const sort = normalize(firstQueryValue(query.sort));
    const sorted = [...items];

    switch (sort) {
      case "city":
        sorted.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
        break;
      case "founded":
        sorted.sort((a, b) => a.founded - b.founded || a.name.localeCompare(b.name));
        break;
      case "programs":
        sorted.sort((a, b) => (b.counts?.programs ?? 0) - (a.counts?.programs ?? 0) || a.name.localeCompare(b.name));
        break;
      case "students":
        sorted.sort((a, b) => b.students - a.students || a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return sorted;
  };
}

function sortPrograms<T extends Program>(items: T[], query: CatalogQuery): T[] {
  const sort = normalize(firstQueryValue(query.sort));
  const sorted = [...items];

  switch (sort) {
    case "duration":
      sorted.sort((a, b) => a.durationYears - b.durationYears || a.name.localeCompare(b.name));
      break;
    case "field":
      sorted.sort((a, b) => a.field.localeCompare(b.field) || a.name.localeCompare(b.name));
      break;
    case "tuition":
      sorted.sort(
        (a, b) =>
          (a.tuitionPerYear?.amount ?? Number.POSITIVE_INFINITY) -
            (b.tuitionPerYear?.amount ?? Number.POSITIVE_INFINITY) || a.name.localeCompare(b.name)
      );
      break;
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return sorted;
}

function enrichProgram(program: Program, catalog: Catalog) {
  return {
    ...program,
    campus: toCampusSummary(catalog.campuses.find((item) => item.id === program.campusId)),
    faculty: toFacultySummary(catalog.faculties.find((item) => item.id === program.facultyId)),
    university: toUniversitySummary(catalog.universities.find((item) => item.id === program.universityId))
  };
}

function toUniversitySummary(university: University | undefined) {
  if (!university) {
    return null;
  }

  return {
    id: university.id,
    name: university.name,
    shortName: university.shortName,
    city: university.city,
    country: university.country,
    type: university.type
  };
}

function toFacultySummary(faculty: Faculty | undefined) {
  if (!faculty) {
    return null;
  }

  return {
    id: faculty.id,
    universityId: faculty.universityId,
    name: faculty.name,
    shortName: faculty.shortName
  };
}

function toCampusSummary(campus: Campus | undefined) {
  if (!campus) {
    return null;
  }

  return {
    id: campus.id,
    universityId: campus.universityId,
    name: campus.name,
    city: campus.city,
    country: campus.country,
    address: campus.address
  };
}

function toProgramSummary(program: Program) {
  return {
    id: program.id,
    name: program.name,
    degree: program.degree,
    field: program.field,
    language: program.language,
    studyMode: program.studyMode
  };
}
