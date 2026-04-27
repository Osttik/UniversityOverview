import { randomUUID } from "node:crypto";

import { HttpError } from "../errors/http-error.js";
import { JsonStore } from "../persistence/json-store.js";

export interface Faculty {
  id: string;
  universityId?: string | null;
  name: string;
  description?: string | null;
  dean?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FacultyProgram {
  id: string;
  facultyId: string;
  name: string;
  degree: string;
  durationYears: number;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AcademicCatalogDataFile {
  faculties: Faculty[];
  programs: FacultyProgram[];
}

interface FacultyMutation {
  [key: string]: string | null | undefined;
  name?: string;
  description?: string | null;
  dean?: string | null;
}

interface ProgramMutation {
  [key: string]: string | number | null | undefined;
  facultyId?: string;
  name?: string;
  degree?: string;
  durationYears?: number;
  description?: string | null;
}

export interface ProgramListFilters {
  facultyId?: string;
}

export type PublicFaculty = Faculty & { programCount: number };
export type PublicProgram = FacultyProgram & { facultyName: string | null };

export class AcademicCatalogService {
  private readonly store: JsonStore<AcademicCatalogDataFile>;
  private initializePromise: Promise<void> | null = null;

  constructor(filePath: string) {
    this.store = new JsonStore<AcademicCatalogDataFile>(filePath, { faculties: [], programs: [] });
  }

  async initialize() {
    this.initializePromise ??= this.initializeStore();
    return this.initializePromise;
  }

  async listFaculties() {
    const data = await this.readData();
    return data.faculties.map((faculty) => publicFaculty(faculty, data.programs));
  }

  async findFacultyById(id: string) {
    const data = await this.readData();
    const faculty = data.faculties.find((item) => item.id === id);
    return faculty ? publicFaculty(faculty, data.programs) : null;
  }

  async createFaculty(input: unknown) {
    await this.initialize();
    const mutation = validateFacultyMutation(input, false);
    const now = new Date().toISOString();

    const faculty: Faculty = {
      id: randomUUID(),
      name: mutation.name ?? "",
      description: mutation.description ?? null,
      dean: mutation.dean ?? null,
      createdAt: now,
      updatedAt: now
    };

    await this.store.transaction(async ({ read, write }) => {
      const data = await read();
      ensureAcademicCatalogData(data);
      data.faculties.push(faculty);
      await write(data);
    });

    return { ...faculty, programCount: 0 };
  }

  async updateFaculty(id: string, input: unknown) {
    await this.initialize();
    const mutation = validateFacultyMutation(input, true);

    return this.store.transaction(async ({ read, write }) => {
      const data = await read();
      ensureAcademicCatalogData(data);
      const index = data.faculties.findIndex((item) => item.id === id);

      if (index === -1) {
        return null;
      }

      const updated = {
        ...data.faculties[index],
        ...mutation,
        id,
        updatedAt: new Date().toISOString()
      };

      data.faculties[index] = updated;
      await write(data);

      return publicFaculty(updated, data.programs);
    });
  }

  async deleteFaculty(id: string) {
    await this.initialize();

    return this.store.transaction(async ({ read, write }) => {
      const data = await read();
      ensureAcademicCatalogData(data);
      const index = data.faculties.findIndex((item) => item.id === id);

      if (index === -1) {
        return false;
      }

      if (data.programs.some((program) => program.facultyId === id)) {
        throw new HttpError(409, "Faculty cannot be deleted while programs reference it.", {
          code: "FACULTY_HAS_PROGRAMS"
        });
      }

      data.faculties.splice(index, 1);
      await write(data);

      return true;
    });
  }

  async listPrograms(filters: ProgramListFilters = {}) {
    const data = await this.readData();
    const programs = filters.facultyId
      ? data.programs.filter((program) => program.facultyId === filters.facultyId)
      : data.programs;

    return programs.map((program) => publicProgram(program, data.faculties));
  }

  async findProgramById(id: string) {
    const data = await this.readData();
    const program = data.programs.find((item) => item.id === id);
    return program ? publicProgram(program, data.faculties) : null;
  }

  async createProgram(input: unknown) {
    await this.initialize();
    const mutation = validateProgramMutation(input, false);
    const now = new Date().toISOString();

    return this.store.transaction(async ({ read, write }) => {
      const data = await read();
      ensureAcademicCatalogData(data);
      ensureFacultyExists(data, mutation.facultyId ?? "");

      const program: FacultyProgram = {
        id: randomUUID(),
        facultyId: mutation.facultyId ?? "",
        name: mutation.name ?? "",
        degree: mutation.degree ?? "",
        durationYears: mutation.durationYears ?? 0,
        description: mutation.description ?? null,
        createdAt: now,
        updatedAt: now
      };

      data.programs.push(program);
      await write(data);

      return publicProgram(program, data.faculties);
    });
  }

  async updateProgram(id: string, input: unknown) {
    await this.initialize();
    const mutation = validateProgramMutation(input, true);

    return this.store.transaction(async ({ read, write }) => {
      const data = await read();
      ensureAcademicCatalogData(data);
      const index = data.programs.findIndex((item) => item.id === id);

      if (index === -1) {
        return null;
      }

      if (mutation.facultyId !== undefined) {
        ensureFacultyExists(data, mutation.facultyId);
      }

      const updated = {
        ...data.programs[index],
        ...mutation,
        id,
        updatedAt: new Date().toISOString()
      };

      data.programs[index] = updated;
      await write(data);

      return publicProgram(updated, data.faculties);
    });
  }

  async deleteProgram(id: string) {
    await this.initialize();

    return this.store.transaction(async ({ read, write }) => {
      const data = await read();
      ensureAcademicCatalogData(data);
      const index = data.programs.findIndex((item) => item.id === id);

      if (index === -1) {
        return false;
      }

      data.programs.splice(index, 1);
      await write(data);

      return true;
    });
  }

  private async readData() {
    await this.initialize();
    const data = await this.store.read();
    ensureAcademicCatalogData(data);
    return data;
  }

  private async initializeStore() {
    await this.store.initialize();
    const data = await this.store.read();
    ensureAcademicCatalogData(data);
  }
}

function publicFaculty(faculty: Faculty, programs: FacultyProgram[]): PublicFaculty {
  return {
    ...faculty,
    programCount: programs.filter((program) => program.facultyId === faculty.id).length
  };
}

function publicProgram(program: FacultyProgram, faculties: Faculty[]): PublicProgram {
  const faculty = faculties.find((item) => item.id === program.facultyId);

  return {
    ...program,
    facultyName: faculty?.name ?? null
  };
}

function validateFacultyMutation(input: unknown, partial: boolean): FacultyMutation {
  const value = requirePlainObject(input, "faculty");
  const errors: string[] = [];
  const mutation: FacultyMutation = {};

  rejectUnknownFields(value, ["name", "description", "dean"], "faculty", errors);
  readText(value, "name", { required: !partial, rejectBlank: true, maxLength: 200 }, mutation, errors);
  readText(value, "description", { maxLength: 4000, nullable: true }, mutation, errors);
  readText(value, "dean", { maxLength: 200, nullable: true }, mutation, errors);

  if (errors.length > 0) {
    throw validationError(errors);
  }

  return mutation;
}

function validateProgramMutation(input: unknown, partial: boolean): ProgramMutation {
  const value = requirePlainObject(input, "program");
  const errors: string[] = [];
  const mutation: ProgramMutation = {};

  rejectUnknownFields(value, ["facultyId", "name", "degree", "durationYears", "description"], "program", errors);
  readText(value, "facultyId", { required: !partial, rejectBlank: true, maxLength: 120 }, mutation, errors);
  readText(value, "name", { required: !partial, rejectBlank: true, maxLength: 200 }, mutation, errors);
  readText(value, "degree", { required: !partial, rejectBlank: true, maxLength: 120 }, mutation, errors);
  readDurationYears(value, partial, mutation, errors);
  readText(value, "description", { maxLength: 4000, nullable: true }, mutation, errors);

  if (errors.length > 0) {
    throw validationError(errors);
  }

  return mutation;
}

function readText<TMutation extends Record<string, unknown>>(
  input: Record<string, unknown>,
  key: string,
  options: { required?: boolean; rejectBlank?: boolean; maxLength: number; nullable?: boolean },
  output: TMutation,
  errors: string[]
) {
  if (!Object.hasOwn(input, key)) {
    if (options.required) {
      errors.push(`${key} is required.`);
    }
    return;
  }

  const value = input[key];

  if (value === null && options.nullable) {
    output[key as keyof TMutation] = null as TMutation[keyof TMutation];
    return;
  }

  if (typeof value !== "string") {
    errors.push(`${key} must be a string.`);
    return;
  }

  const trimmed = value.trim();

  if ((options.required || options.rejectBlank) && trimmed.length === 0) {
    errors.push(`${key} cannot be empty.`);
  }

  if (trimmed.length > options.maxLength) {
    errors.push(`${key} must be ${options.maxLength} characters or fewer.`);
  }

  output[key as keyof TMutation] = trimmed as TMutation[keyof TMutation];
}

function readDurationYears(input: Record<string, unknown>, partial: boolean, output: ProgramMutation, errors: string[]) {
  if (!Object.hasOwn(input, "durationYears")) {
    if (!partial) {
      errors.push("durationYears is required.");
    }
    return;
  }

  const value = input.durationYears;

  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    errors.push("durationYears must be a positive integer.");
    return;
  }

  output.durationYears = value;
}

function ensureFacultyExists(data: AcademicCatalogDataFile, facultyId: string) {
  if (!data.faculties.some((faculty) => faculty.id === facultyId)) {
    throw new HttpError(400, "facultyId does not reference an existing faculty.", {
      code: "FACULTY_NOT_FOUND"
    });
  }
}

function ensureAcademicCatalogData(value: unknown): asserts value is AcademicCatalogDataFile {
  if (!isPlainObject(value) || !Array.isArray(value.faculties) || !Array.isArray(value.programs)) {
    throw new HttpError(500, "academics.json must contain faculties and programs arrays.", {
      code: "INVALID_DATA_FILE",
      expose: false
    });
  }
}

function requirePlainObject(input: unknown, label: string) {
  if (!isPlainObject(input)) {
    throw validationError([`${label} must be an object.`]);
  }

  return input;
}

function rejectUnknownFields(input: Record<string, unknown>, allowed: string[], label: string, errors: string[]) {
  for (const key of Object.keys(input)) {
    if (!allowed.includes(key)) {
      errors.push(`${label}.${key} is not supported.`);
    }
  }
}

function validationError(details: string[]) {
  return new HttpError(400, "Request payload failed validation.", {
    code: "VALIDATION_ERROR",
    details
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
