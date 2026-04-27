import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { join } from "node:path";

type StudyProgram = {
  id: string;
  facultyId: string;
  facultyName: string;
  name: string;
  degree: string;
  mode: "full-time" | "part-time" | "online" | "hybrid";
  durationYears: number;
  language: string;
  tuitionPerYear: number;
  description: string;
};

type Faculty = {
  id: string;
  universityId: string;
  name: string;
  description: string;
  dean: string;
  programs: StudyProgram[];
};

type University = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  website: string;
  status: "active" | "inactive" | "draft";
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contacts: {
    email: string;
    phone: string;
  };
  faculties: Faculty[];
};

type TuitionRange = {
  min: number;
  max: number;
  currency: "UAH";
};

type NumberRange = {
  min: number;
  max: number;
};

const app = express();
const port = Number(process.env.PORT ?? 3000);
const dataFile = join(process.cwd(), "data", "universities.json");

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "university-overview-api"
  });
});

app.get("/api/universities", async (request, response, next) => {
  try {
    const universities = await readUniversities();
    const search = singleQueryValue(request.query.search)?.toLowerCase();
    const filtered = search
      ? universities.filter((university) =>
          [university.name, university.shortName, university.city, university.country].some((value) =>
            value.toLowerCase().includes(search)
          )
        )
      : universities;

    response.json({
      data: filtered.map(toUniversitySummary),
      count: filtered.length
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/detail-pages/:key/overview", async (request, response, next) => {
  try {
    const university = findUniversityByKey(await readUniversities(), request.params.key);

    if (!university) {
      response.status(404).json({
        error: "not_found",
        message: "University was not found."
      });
      return;
    }

    response.json({ data: toUniversityOverview(university) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/universities/:id/overview", async (request, response, next) => {
  try {
    const university = findUniversityByKey(await readUniversities(), request.params.id);

    if (!university) {
      response.status(404).json({
        error: "not_found",
        message: "University was not found."
      });
      return;
    }

    response.json({ data: toUniversityOverview(university) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/universities/:id", async (request, response, next) => {
  try {
    const university = (await readUniversities()).find((item) => item.id === request.params.id);

    if (!university) {
      response.status(404).json({
        error: "not_found",
        message: "University was not found."
      });
      return;
    }

    response.json({ data: university });
  } catch (error) {
    next(error);
  }
});

app.post("/api/universities", async (request, response, next) => {
  try {
    const universities = await readUniversities();
    const university = normalizeUniversity(request.body);
    const error = validateUniversity(university);

    if (error) {
      response.status(400).json({ error: "validation_error", message: error });
      return;
    }

    universities.push(university);
    await saveUniversities(universities);
    response.status(201).json({ data: university });
  } catch (error) {
    next(error);
  }
});

app.put("/api/universities/:id", async (request, response, next) => {
  try {
    const universities = await readUniversities();
    const index = universities.findIndex((item) => item.id === request.params.id);

    if (index === -1) {
      response.status(404).json({
        error: "not_found",
        message: "University was not found."
      });
      return;
    }

    const university = normalizeUniversity(request.body, universities[index]);
    const error = validateUniversity(university);

    if (error) {
      response.status(400).json({ error: "validation_error", message: error });
      return;
    }

    university.faculties = university.faculties.map((faculty) => ({
      ...faculty,
      universityId: university.id,
      programs: faculty.programs.map((program) => ({
        ...program,
        facultyId: faculty.id,
        facultyName: faculty.name
      }))
    }));
    universities[index] = university;
    await saveUniversities(universities);
    response.json({ data: university });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/universities/:id", async (request, response, next) => {
  try {
    const universities = await readUniversities();
    const filtered = universities.filter((item) => item.id !== request.params.id);

    if (filtered.length === universities.length) {
      response.status(404).json({
        error: "not_found",
        message: "University was not found."
      });
      return;
    }

    await saveUniversities(filtered);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/universities/:id/faculties", async (request, response, next) => {
  try {
    const university = (await readUniversities()).find((item) => item.id === request.params.id);

    if (!university) {
      response.status(404).json({
        error: "not_found",
        message: "University was not found."
      });
      return;
    }

    response.json({
      data: university.faculties.map(toFacultySummary),
      count: university.faculties.length
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/faculties", async (_request, response, next) => {
  try {
    const faculties = (await readUniversities()).flatMap((university) => university.faculties);
    response.json({
      data: faculties.map(toFacultySummary),
      count: faculties.length
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/faculties/:id", async (request, response, next) => {
  try {
    const faculty = findFaculty(await readUniversities(), request.params.id)?.faculty;

    if (!faculty) {
      response.status(404).json({
        error: "not_found",
        message: "Faculty was not found."
      });
      return;
    }

    response.json({ data: toFacultySummary(faculty) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/faculties", async (request, response, next) => {
  try {
    const universities = await readUniversities();
    const university = universities.find((item) => item.id === normalizeText(request.body.universityId));

    if (!university) {
      response.status(400).json({
        error: "validation_error",
        message: "Faculty must belong to an existing university."
      });
      return;
    }

    const faculty = normalizeFaculty(request.body, university.id);
    const error = validateFaculty(faculty);

    if (error) {
      response.status(400).json({ error: "validation_error", message: error });
      return;
    }

    university.faculties.push(faculty);
    await saveUniversities(universities);
    response.status(201).json({ data: toFacultySummary(faculty) });
  } catch (error) {
    next(error);
  }
});

app.put("/api/faculties/:id", async (request, response, next) => {
  try {
    const universities = await readUniversities();
    const current = findFaculty(universities, request.params.id);
    const targetUniversity = universities.find((item) => item.id === normalizeText(request.body.universityId));

    if (!current) {
      response.status(404).json({
        error: "not_found",
        message: "Faculty was not found."
      });
      return;
    }

    if (!targetUniversity) {
      response.status(400).json({
        error: "validation_error",
        message: "Faculty must belong to an existing university."
      });
      return;
    }

    const faculty = normalizeFaculty(request.body, targetUniversity.id, current.faculty);
    const error = validateFaculty(faculty);

    if (error) {
      response.status(400).json({ error: "validation_error", message: error });
      return;
    }

    faculty.programs = faculty.programs.map((program) => ({
      ...program,
      facultyId: faculty.id,
      facultyName: faculty.name
    }));
    current.university.faculties = current.university.faculties.filter((item) => item.id !== faculty.id);
    targetUniversity.faculties.push(faculty);
    await saveUniversities(universities);
    response.json({ data: toFacultySummary(faculty) });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/faculties/:id", async (request, response, next) => {
  try {
    const universities = await readUniversities();
    const current = findFaculty(universities, request.params.id);

    if (!current) {
      response.status(404).json({
        error: "not_found",
        message: "Faculty was not found."
      });
      return;
    }

    current.university.faculties = current.university.faculties.filter((item) => item.id !== current.faculty.id);
    await saveUniversities(universities);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/programs", async (request, response, next) => {
  try {
    const facultyId = singleQueryValue(request.query.facultyId);
    const programs = (await readUniversities()).flatMap((university) =>
      university.faculties.flatMap((faculty) => faculty.programs)
    );
    const filtered = facultyId ? programs.filter((program) => program.facultyId === facultyId) : programs;

    response.json({
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/programs/:id", async (request, response, next) => {
  try {
    const current = findProgram(await readUniversities(), request.params.id);

    if (!current) {
      response.status(404).json({
        error: "not_found",
        message: "Program was not found."
      });
      return;
    }

    response.json({ data: toProgramResponse(current.program, current.university) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/programs", async (request, response, next) => {
  try {
    const universities = await readUniversities();
    const current = findFaculty(universities, normalizeText(request.body.facultyId));

    if (!current) {
      response.status(400).json({
        error: "validation_error",
        message: "Program must belong to an existing faculty."
      });
      return;
    }

    const program = normalizeProgram(request.body, current.faculty);
    const error = validateProgram(program);

    if (error) {
      response.status(400).json({ error: "validation_error", message: error });
      return;
    }

    current.faculty.programs.push(program);
    await saveUniversities(universities);
    response.status(201).json({ data: toProgramResponse(program, current.university) });
  } catch (error) {
    next(error);
  }
});

app.put("/api/programs/:id", async (request, response, next) => {
  try {
    const universities = await readUniversities();
    const current = findProgram(universities, request.params.id);
    const targetFaculty = findFaculty(universities, normalizeText(request.body.facultyId));

    if (!current) {
      response.status(404).json({
        error: "not_found",
        message: "Program was not found."
      });
      return;
    }

    if (!targetFaculty) {
      response.status(400).json({
        error: "validation_error",
        message: "Program must belong to an existing faculty."
      });
      return;
    }

    const program = normalizeProgram(request.body, targetFaculty.faculty, current.program);
    const error = validateProgram(program);

    if (error) {
      response.status(400).json({ error: "validation_error", message: error });
      return;
    }

    current.faculty.programs = current.faculty.programs.filter((item) => item.id !== program.id);
    targetFaculty.faculty.programs.push(program);
    await saveUniversities(universities);
    response.json({ data: toProgramResponse(program, targetFaculty.university) });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/programs/:id", async (request, response, next) => {
  try {
    const universities = await readUniversities();
    const current = findProgram(universities, request.params.id);

    if (!current) {
      response.status(404).json({
        error: "not_found",
        message: "Program was not found."
      });
      return;
    }

    current.faculty.programs = current.faculty.programs.filter((item) => item.id !== current.program.id);
    await saveUniversities(universities);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  response.status(500).json({
    error: "internal_server_error",
    message: error.message
  });
});

app.listen(port, () => {
  console.log(`University Overview API listening on port ${port}`);
});

async function readUniversities(): Promise<University[]> {
  const payload = await fs.readFile(dataFile, "utf8");
  return JSON.parse(payload) as University[];
}

async function saveUniversities(universities: University[]): Promise<void> {
  await fs.writeFile(dataFile, `${JSON.stringify(universities, null, 2)}\n`, "utf8");
}

function findUniversityByKey(universities: University[], key: string) {
  const normalized = normalize(key);

  return (
    universities.find((university) =>
      [university.id, university.shortName, university.name].some((value) => normalize(value) === normalized)
    ) ?? null
  );
}

function toUniversitySummary(university: University) {
  const programs = university.faculties.flatMap((faculty) => faculty.programs);

  return {
    id: university.id,
    name: university.name,
    shortName: university.shortName,
    city: university.city,
    country: university.country,
    website: university.website,
    status: university.status,
    description: university.description,
    coordinates: university.coordinates,
    contacts: university.contacts,
    facultyCount: university.faculties.length,
    programCount: programs.length,
    faculties: university.faculties.map(toFacultySummary)
  };
}

function toUniversityOverview(university: University) {
  const programs = university.faculties.flatMap((faculty) => faculty.programs);
  const faculties = university.faculties.map(toFacultySummary);

  return {
    id: university.id,
    name: university.name,
    shortName: university.shortName,
    description: university.description,
    status: university.status,
    website: university.website,
    location: {
      country: university.country,
      city: university.city,
      latitude: university.coordinates.latitude,
      longitude: university.coordinates.longitude
    },
    contacts: university.contacts,
    metrics: {
      faculties: faculties.length,
      programs: programs.length,
      tuitionRange: getTuitionRange(programs),
      durationYears: getDurationYearsRange(programs),
      studyModes: uniqueSorted(programs.map((program) => program.mode)),
      programLevels: countValues(programs.map((program) => program.degree)),
      languages: uniqueSorted(programs.map((program) => program.language))
    },
    faculties,
    programs
  };
}

function toFacultySummary(faculty: Faculty) {
  return {
    id: faculty.id,
    universityId: faculty.universityId,
    name: faculty.name,
    description: faculty.description,
    dean: faculty.dean,
    programCount: faculty.programs.length,
    programs: faculty.programs
  };
}

function toProgramResponse(program: StudyProgram, university: University) {
  return {
    ...program,
    universityId: university.id
  };
}

function normalizeUniversity(body: Partial<University>, existing?: University): University {
  return {
    id: existing?.id ?? createId("university", body.name),
    name: normalizeText(body.name),
    shortName: normalizeText(body.shortName),
    city: normalizeText(body.city),
    country: normalizeText(body.country) || "Ukraine",
    website: normalizeText(body.website),
    status: isUniversityStatus(body.status) ? body.status : "draft",
    description: normalizeText(body.description),
    coordinates: {
      latitude: normalizeNumber(body.coordinates?.latitude),
      longitude: normalizeNumber(body.coordinates?.longitude)
    },
    contacts: {
      email: normalizeText(body.contacts?.email),
      phone: normalizeText(body.contacts?.phone)
    },
    faculties: existing?.faculties ?? []
  };
}

function normalizeFaculty(body: Partial<Faculty>, universityId: string, existing?: Faculty): Faculty {
  return {
    id: existing?.id ?? createId("faculty", body.name),
    universityId,
    name: normalizeText(body.name),
    description: normalizeText(body.description),
    dean: normalizeText(body.dean),
    programs: existing?.programs ?? []
  };
}

function normalizeProgram(body: Partial<StudyProgram>, faculty: Faculty, existing?: StudyProgram): StudyProgram {
  return {
    id: existing?.id ?? createId("program", body.name),
    facultyId: faculty.id,
    facultyName: faculty.name,
    name: normalizeText(body.name),
    degree: normalizeText(body.degree) || "Bachelor",
    mode: isStudyMode(body.mode) ? body.mode : "full-time",
    durationYears: normalizeNumber(body.durationYears),
    language: normalizeText(body.language) || "Ukrainian",
    tuitionPerYear: normalizeNumber(body.tuitionPerYear),
    description: normalizeText(body.description)
  };
}

function validateUniversity(university: University): string | null {
  if (!university.name) {
    return "University name is required.";
  }

  if (!university.city) {
    return "University city is required.";
  }

  return null;
}

function validateFaculty(faculty: Faculty): string | null {
  return faculty.name ? null : "Faculty name is required.";
}

function validateProgram(program: StudyProgram): string | null {
  return program.name ? null : "Program name is required.";
}

function findFaculty(universities: University[], facultyId: string) {
  for (const university of universities) {
    const faculty = university.faculties.find((item) => item.id === facultyId);

    if (faculty) {
      return { university, faculty };
    }
  }

  return null;
}

function findProgram(universities: University[], programId: string) {
  for (const university of universities) {
    for (const faculty of university.faculties) {
      const program = faculty.programs.find((item) => item.id === programId);

      if (program) {
        return { university, faculty, program };
      }
    }
  }

  return null;
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

function getDurationYearsRange(programs: StudyProgram[]): NumberRange | null {
  const durationValues = programs.map((program) => program.durationYears).filter(isFiniteNumber);

  if (durationValues.length === 0) {
    return null;
  }

  return {
    min: Math.min(...durationValues),
    max: Math.max(...durationValues)
  };
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

function singleQueryValue(value: unknown) {
  return Array.isArray(value) ? String(value[0] ?? "") : value === undefined ? undefined : String(value);
}

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
}

function createId(prefix: string, value: unknown) {
  const slug = normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  return `${prefix}-${slug || randomUUID().slice(0, 8)}-${randomUUID().slice(0, 8)}`;
}

function isUniversityStatus(value: unknown): value is University["status"] {
  return value === "active" || value === "inactive" || value === "draft";
}

function isStudyMode(value: unknown): value is StudyProgram["mode"] {
  return value === "full-time" || value === "part-time" || value === "online" || value === "hybrid";
}
