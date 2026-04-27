import { randomUUID } from "node:crypto";

import { HttpError } from "../errors/http-error.js";
import { type University, validateUniversity } from "../domain/schemas.js";
import { JsonStore } from "./json-store.js";

interface UniversityDataFile {
  universities: University[];
}

export interface UniversityListFilters {
  search?: string;
  country?: string;
  city?: string;
  program?: string;
  status?: University["status"];
}

export class JsonUniversityRepository {
  private readonly store: JsonStore<UniversityDataFile>;
  private initializePromise: Promise<void> | null = null;

  constructor(filePath: string) {
    this.store = new JsonStore<UniversityDataFile>(filePath, { universities: [] });
  }

  async initialize() {
    this.initializePromise ??= this.initializeStore();
    return this.initializePromise;
  }

  async list(filters: UniversityListFilters = {}) {
    await this.initialize();
    const data = await this.store.read();
    return data.universities.filter((university) => matchesFilters(university, filters));
  }

  async findById(id: string) {
    await this.initialize();
    const data = await this.store.read();
    const universities = data.universities;
    return universities.find((university) => university.id === id) ?? null;
  }

  async create(input: unknown) {
    await this.initialize();

    if (!isPlainObject(input)) {
      throw validationError(["university must be an object."]);
    }

    const now = new Date().toISOString();
    const candidate = {
      ...input,
      id: randomUUID(),
      status: input.status ?? "draft",
      programs: input.programs ?? [],
      createdAt: now,
      updatedAt: now
    };

    const validation = validateUniversity(candidate, { allowGenerated: true });
    if (!validation.valid) {
      throw validationError(validation.errors);
    }

    const created = assignProgramIds(validation.value as University);

    await this.store.transaction(async ({ read, write }) => {
      const data = await read();
      data.universities.push(created);
      await write(data);
    });

    return created;
  }

  async update(id: string, input: unknown) {
    await this.initialize();

    if (!isPlainObject(input)) {
      throw validationError(["university must be an object."]);
    }

    return this.store.transaction(async ({ read, write }) => {
      const data = await read();
      const index = data.universities.findIndex((university) => university.id === id);

      if (index === -1) {
        return null;
      }

      const existing = data.universities[index];
      const candidate = {
        ...existing,
        ...input,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString()
      };

      const validation = validateUniversity(candidate, { allowGenerated: true });
      if (!validation.valid) {
        throw validationError(validation.errors);
      }

      const updated = assignProgramIds(validation.value as University);
      data.universities[index] = updated;
      await write(data);

      return updated;
    });
  }

  async patch(id: string, input: unknown) {
    await this.initialize();

    if (!isPlainObject(input)) {
      throw validationError(["university must be an object."]);
    }

    return this.store.transaction(async ({ read, write }) => {
      const data = await read();
      const index = data.universities.findIndex((university) => university.id === id);

      if (index === -1) {
        return null;
      }

      const existing = data.universities[index];
      const validation = validateUniversity(input, { partial: true });
      if (!validation.valid) {
        throw validationError(validation.errors);
      }

      const patched = assignProgramIds({
        ...existing,
        ...validation.value,
        location: validation.value.location
          ? { ...existing.location, ...validation.value.location }
          : existing.location,
        contacts:
          validation.value.contacts === undefined
            ? existing.contacts
            : validation.value.contacts === null
              ? null
              : { ...existing.contacts, ...validation.value.contacts },
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString()
      } as University);

      const finalValidation = validateUniversity(patched, { allowGenerated: true });
      if (!finalValidation.valid) {
        throw validationError(finalValidation.errors);
      }

      data.universities[index] = finalValidation.value as University;
      await write(data);

      return data.universities[index];
    });
  }

  async delete(id: string) {
    await this.initialize();

    return this.store.transaction(async ({ read, write }) => {
      const data = await read();
      const nextUniversities = data.universities.filter((university) => university.id !== id);

      if (nextUniversities.length === data.universities.length) {
        return false;
      }

      data.universities = nextUniversities;
      await write(data);

      return true;
    });
  }

  private async initializeStore() {
    await this.store.initialize();
    const data = await this.store.read();

    if (!isUniversityDataFile(data)) {
      throw new HttpError(500, "universities.json must contain a universities array.", {
        code: "INVALID_DATA_FILE",
        expose: false
      });
    }
  }
}

function assignProgramIds(university: University): University {
  return {
    ...university,
    programs: university.programs.map((program) => ({
      ...program,
      id: program.id || randomUUID()
    }))
  };
}

function validationError(details: string[]) {
  return new HttpError(400, "Request payload failed validation.", {
    code: "VALIDATION_ERROR",
    details
  });
}

function matchesFilters(university: University, filters: UniversityListFilters) {
  if (filters.country && normalize(university.location.country) !== normalize(filters.country)) {
    return false;
  }

  if (filters.city && normalize(university.location.city) !== normalize(filters.city)) {
    return false;
  }

  if (filters.status && university.status !== filters.status) {
    return false;
  }

  if (filters.program && !university.programs.some((program) => programMatches(program, filters.program ?? ""))) {
    return false;
  }

  if (filters.search && !searchableText(university).includes(normalize(filters.search))) {
    return false;
  }

  return true;
}

function programMatches(program: University["programs"][number], filter: string) {
  const normalized = normalize(filter);
  return [program.name, program.degree, program.mode, program.language].some((value) => normalize(value).includes(normalized));
}

function searchableText(university: University) {
  return [
    university.name,
    university.shortName,
    university.description,
    university.website,
    university.status,
    university.location.country,
    university.location.city,
    university.location.address,
    university.contacts?.email,
    university.contacts?.phone,
    ...university.programs.flatMap((program) => [
      program.name,
      program.degree,
      program.mode,
      program.language,
      program.durationMonths?.toString(),
      program.tuitionPerYear?.toString()
    ])
  ]
    .map(normalize)
    .join(" ");
}

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function isUniversityDataFile(value: unknown): value is UniversityDataFile {
  return isPlainObject(value) && Array.isArray(value.universities);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
