import { loadCatalog } from './dataStore.js';

const searchableKeys = ['name', 'shortName', 'city', 'country', 'summary', 'description', 'field', 'degree', 'language', 'studyMode'];

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function includesText(value, query) {
  return normalize(value).includes(query);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function matchesQuery(item, query) {
  if (!query) {
    return true;
  }

  return searchableKeys.some((key) => includesText(item[key], query))
    || (Array.isArray(item.tags) && item.tags.some((tag) => includesText(tag, query)));
}

function matchesExact(value, expected) {
  return !expected || normalize(value) === normalize(expected);
}

function maybeNumber(value) {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function paginate(items, query) {
  const page = Math.max(maybeNumber(query.page) ?? 1, 1);
  const limit = Math.min(Math.max(maybeNumber(query.limit) ?? items.length, 1), 100);
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    meta: {
      total: items.length,
      page,
      limit
    }
  };
}

function enrichProgram(program, catalog) {
  const university = catalog.universities.find((item) => item.id === program.universityId);
  const faculty = catalog.faculties.find((item) => item.id === program.facultyId);
  const campus = catalog.campuses.find((item) => item.id === program.campusId);

  return {
    ...program,
    university: university ? toUniversitySummary(university) : null,
    faculty: faculty ? toFacultySummary(faculty) : null,
    campus: campus ? toCampusSummary(campus) : null
  };
}

function toUniversitySummary(university) {
  return {
    id: university.id,
    name: university.name,
    shortName: university.shortName,
    city: university.city,
    country: university.country,
    type: university.type
  };
}

function toFacultySummary(faculty) {
  return {
    id: faculty.id,
    universityId: faculty.universityId,
    name: faculty.name
  };
}

function toCampusSummary(campus) {
  return {
    id: campus.id,
    universityId: campus.universityId,
    name: campus.name,
    city: campus.city,
    address: campus.address
  };
}

export async function listUniversities(query = {}) {
  const catalog = await loadCatalog();
  const q = normalize(query.q ?? query.search);
  const filtered = catalog.universities.filter((university) => (
    matchesQuery(university, q)
    && matchesExact(university.city, query.city)
    && matchesExact(university.country, query.country)
    && matchesExact(university.type, query.type)
  ));

  return paginate(filtered.map((university) => ({
    ...university,
    counts: {
      campuses: catalog.campuses.filter((campus) => campus.universityId === university.id).length,
      faculties: catalog.faculties.filter((faculty) => faculty.universityId === university.id).length,
      programs: catalog.programs.filter((program) => program.universityId === university.id).length
    }
  })), query);
}

export async function getUniversityDetail(id) {
  const catalog = await loadCatalog();
  const university = catalog.universities.find((item) => item.id === id);

  if (!university) {
    return null;
  }

  const faculties = catalog.faculties.filter((item) => item.universityId === id);
  const campuses = catalog.campuses.filter((item) => item.universityId === id);
  const programs = catalog.programs.filter((item) => item.universityId === id).map((program) => enrichProgram(program, catalog));

  return {
    ...university,
    faculties,
    campuses,
    programs
  };
}

export async function listFaculties(query = {}) {
  const catalog = await loadCatalog();
  const q = normalize(query.q ?? query.search);
  const filtered = catalog.faculties.filter((faculty) => (
    matchesQuery(faculty, q)
    && matchesExact(faculty.universityId, query.universityId)
  ));

  return paginate(filtered.map((faculty) => ({
    ...faculty,
    university: toUniversitySummary(catalog.universities.find((item) => item.id === faculty.universityId) ?? {})
  })), query);
}

export async function getFacultyDetail(id) {
  const catalog = await loadCatalog();
  const faculty = catalog.faculties.find((item) => item.id === id);

  if (!faculty) {
    return null;
  }

  return {
    ...faculty,
    university: catalog.universities.find((item) => item.id === faculty.universityId) ?? null,
    programs: catalog.programs.filter((item) => item.facultyId === id).map((program) => enrichProgram(program, catalog))
  };
}

export async function listCampuses(query = {}) {
  const catalog = await loadCatalog();
  const q = normalize(query.q ?? query.search);
  const filtered = catalog.campuses.filter((campus) => (
    matchesQuery(campus, q)
    && matchesExact(campus.universityId, query.universityId)
    && matchesExact(campus.city, query.city)
  ));

  return paginate(filtered.map((campus) => ({
    ...campus,
    university: toUniversitySummary(catalog.universities.find((item) => item.id === campus.universityId) ?? {})
  })), query);
}

export async function getCampusDetail(id) {
  const catalog = await loadCatalog();
  const campus = catalog.campuses.find((item) => item.id === id);

  if (!campus) {
    return null;
  }

  return {
    ...campus,
    university: catalog.universities.find((item) => item.id === campus.universityId) ?? null,
    programs: catalog.programs.filter((item) => item.campusId === id).map((program) => enrichProgram(program, catalog))
  };
}

export async function listPrograms(query = {}) {
  const catalog = await loadCatalog();
  const q = normalize(query.q ?? query.search);
  const filtered = catalog.programs.filter((program) => {
    const campus = catalog.campuses.find((item) => item.id === program.campusId);

    return matchesQuery(program, q)
      && matchesExact(program.universityId, query.universityId)
      && matchesExact(program.facultyId, query.facultyId)
      && matchesExact(program.campusId, query.campusId)
      && matchesExact(program.degree, query.degree)
      && matchesExact(program.field, query.field)
      && matchesExact(program.language, query.language)
      && matchesExact(program.studyMode, query.studyMode ?? query.mode)
      && matchesExact(campus?.city, query.city);
  });

  return paginate(filtered.map((program) => enrichProgram(program, catalog)), query);
}

export async function getProgramDetail(id) {
  const catalog = await loadCatalog();
  const program = catalog.programs.find((item) => item.id === id);
  return program ? enrichProgram(program, catalog) : null;
}

export async function getFilters() {
  const catalog = await loadCatalog();

  return {
    cities: uniqueSorted(catalog.universities.map((item) => item.city).concat(catalog.campuses.map((item) => item.city))),
    countries: uniqueSorted(catalog.universities.map((item) => item.country)),
    degrees: uniqueSorted(catalog.programs.map((item) => item.degree)),
    fields: uniqueSorted(catalog.programs.map((item) => item.field)),
    languages: uniqueSorted(catalog.programs.map((item) => item.language)),
    studyModes: uniqueSorted(catalog.programs.map((item) => item.studyMode)),
    universityTypes: uniqueSorted(catalog.universities.map((item) => item.type)),
    universities: catalog.universities.map(toUniversitySummary),
    faculties: catalog.faculties.map(toFacultySummary)
  };
}

export async function searchCatalog(query = {}) {
  const q = normalize(query.q ?? query.search);

  if (!q) {
    return {
      universities: [],
      faculties: [],
      campuses: [],
      programs: [],
      meta: {
        total: 0,
        query: ''
      }
    };
  }

  const catalog = await loadCatalog();
  const universities = catalog.universities.filter((item) => matchesQuery(item, q));
  const faculties = catalog.faculties.filter((item) => matchesQuery(item, q));
  const campuses = catalog.campuses.filter((item) => matchesQuery(item, q));
  const programs = catalog.programs.filter((item) => matchesQuery(item, q)).map((program) => enrichProgram(program, catalog));

  return {
    universities,
    faculties,
    campuses,
    programs,
    meta: {
      total: universities.length + faculties.length + campuses.length + programs.length,
      query: q
    }
  };
}
