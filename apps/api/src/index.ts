import cors from "cors";
import express from "express";
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

function singleQueryValue(value: unknown) {
  return Array.isArray(value) ? String(value[0] ?? "") : value === undefined ? undefined : String(value);
}
