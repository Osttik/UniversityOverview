import { randomUUID } from "node:crypto";

import { HttpError } from "../errors/http-error.js";
import { type University, validateUniversity } from "../domain/schemas.js";
import { JsonStore } from "./json-store.js";

interface UniversityDataFile {
  universities: University[];
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

  async list() {
    await this.initialize();
    const data = await this.store.read();
    return data.universities;
  }

  async findById(id: string) {
    const universities = await this.list();
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

function isUniversityDataFile(value: unknown): value is UniversityDataFile {
  return isPlainObject(value) && Array.isArray(value.universities);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
