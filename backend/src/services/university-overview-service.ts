import { type StudyProgram, type University } from "../domain/schemas.js";
import { type JsonUniversityRepository } from "../persistence/university-repository.js";
import {
  type AcademicCatalogService,
  type PublicFaculty,
  type PublicProgram
} from "./academic-catalog-service.js";

interface TuitionRange {
  min: number;
  max: number;
  currency: "UAH";
}

interface NumberRange {
  min: number;
  max: number;
}

export class UniversityOverviewService {
  constructor(
    private readonly universities: Pick<JsonUniversityRepository, "findByKey">,
    private readonly academics: Pick<AcademicCatalogService, "listFaculties" | "listPrograms">
  ) {}

  async findByUniversityKey(key: string) {
    const university = await this.universities.findByKey(key);

    if (!university) {
      return null;
    }

    const [faculties, academicPrograms] = await Promise.all([
      this.academics.listFaculties(),
      this.academics.listPrograms()
    ]);

    return buildUniversityOverview(university, faculties, academicPrograms);
  }
}

function buildUniversityOverview(
  university: University,
  faculties: PublicFaculty[],
  academicPrograms: PublicProgram[]
) {
  const selectedFaculties = faculties.filter((faculty) => faculty.universityId === university.id);
  const facultyIds = new Set(selectedFaculties.map((faculty) => faculty.id));
  const selectedAcademicPrograms = academicPrograms.filter((program) => facultyIds.has(program.facultyId));
  const facultyOverviews = selectedFaculties.map((faculty) => {
    const programs = selectedAcademicPrograms.filter((program) => program.facultyId === faculty.id);

    return {
      id: faculty.id,
      universityId: faculty.universityId ?? null,
      name: faculty.name,
      description: faculty.description ?? null,
      dean: faculty.dean ?? null,
      programCount: programs.length,
      programs
    };
  });
  const programs = university.programs;

  return {
    id: university.id,
    name: university.name,
    shortName: university.shortName ?? null,
    description: university.description ?? null,
    status: university.status,
    website: university.website ?? null,
    location: university.location,
    contacts: university.contacts ?? null,
    metrics: {
      faculties: facultyOverviews.length,
      programs: programs.length,
      universityPrograms: university.programs.length,
      tuitionRange: getTuitionRange(programs),
      durationYears: getDurationYearsRange(programs),
      studyModes: uniqueSorted(programs.map((program) => program.mode)),
      programLevels: countValues(programs.map((program) => program.degree)),
      languages: uniqueSorted(programs.map((program) => program.language))
    },
    faculties: facultyOverviews,
    programs: university.programs,
    updatedAt: university.updatedAt
  };
}

function getTuitionRange(programs: StudyProgram[]): TuitionRange | null {
  const tuitionValues = programs.map((program) => program.tuitionPerYear).filter(isFiniteNumber);

  if (tuitionValues.length === 0) {
    return null;
  }

  return {
    min: Math.min(...tuitionValues),
    max: Math.max(...tuitionValues),
    currency: "UAH"
  };
}

function getDurationYearsRange(programs: Array<PublicProgram | StudyProgram>): NumberRange | null {
  const durationValues = programs.map(durationYears).filter(isFiniteNumber);

  if (durationValues.length === 0) {
    return null;
  }

  return {
    min: Math.min(...durationValues),
    max: Math.max(...durationValues)
  };
}

function durationYears(program: PublicProgram | StudyProgram) {
  if ("durationYears" in program) {
    return program.durationYears;
  }

  return program.durationMonths ? program.durationMonths / 12 : null;
}

function countValues(values: Array<string | null | undefined>) {
  return values.reduce<Record<string, number>>((counts, item) => {
    const value = item ?? "Unknown";
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort();
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
