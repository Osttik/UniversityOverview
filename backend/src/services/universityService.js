const crypto = require("node:crypto");
const path = require("node:path");
const JsonStore = require("../storage/jsonStore");

const universitiesStore = new JsonStore(
  path.join(__dirname, "..", "..", "data", "universities.json")
);

const REQUIRED_FIELDS = ["name", "country", "city"];
const OPTIONAL_STRING_FIELDS = ["id", "shortName", "address", "website", "description"];

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function toSlug(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function matchesText(university, text) {
  const haystack = [
    university.name,
    university.shortName,
    university.country,
    university.city,
    university.address,
    university.description,
    ...(Array.isArray(university.programs) ? university.programs : [])
  ]
    .map(normalize)
    .join(" ");

  return haystack.includes(normalize(text));
}

function validateUniversity(input, partial = false) {
  const errors = [];

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return ["University payload must be an object."];
  }

  for (const field of REQUIRED_FIELDS) {
    if (!partial || Object.prototype.hasOwnProperty.call(input, field)) {
      if (typeof input[field] !== "string" || input[field].trim() === "") {
        errors.push(`${field} is required.`);
      }
    }
  }

  for (const field of OPTIONAL_STRING_FIELDS) {
    if (
      Object.prototype.hasOwnProperty.call(input, field) &&
      input[field] !== null &&
      typeof input[field] !== "string"
    ) {
      errors.push(`${field} must be a string.`);
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(input, "programs") &&
    (!Array.isArray(input.programs) ||
      input.programs.some((program) => typeof program !== "string" || program.trim() === ""))
  ) {
    errors.push("programs must be an array of non-empty strings.");
  }

  if (
    Object.prototype.hasOwnProperty.call(input, "coordinates") &&
    input.coordinates !== null
  ) {
    const { latitude, longitude } = input.coordinates || {};

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      errors.push("coordinates must include numeric latitude and longitude values in valid ranges.");
    }
  }

  return errors;
}

function sanitizeUniversity(input) {
  const university = {
    name: input.name.trim(),
    shortName: input.shortName?.trim() || null,
    country: input.country.trim(),
    city: input.city.trim(),
    address: input.address?.trim() || null,
    website: input.website?.trim() || null,
    description: input.description?.trim() || null,
    programs: Array.isArray(input.programs)
      ? input.programs.map((program) => program.trim())
      : [],
    coordinates: input.coordinates ?? null
  };

  return university;
}

function mergeUniversity(current, input) {
  const next = { ...current };

  for (const key of [
    "name",
    "shortName",
    "country",
    "city",
    "address",
    "website",
    "description",
    "programs",
    "coordinates"
  ]) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      next[key] = input[key];
    }
  }

  return sanitizeUniversity(next);
}

class UniversityService {
  async list(filters = {}) {
    const universities = await universitiesStore.read([]);

    return universities.filter((university) => {
      if (filters.search && !matchesText(university, filters.search)) {
        return false;
      }

      if (filters.country && normalize(university.country) !== normalize(filters.country)) {
        return false;
      }

      if (filters.city && normalize(university.city) !== normalize(filters.city)) {
        return false;
      }

      if (
        filters.program &&
        !university.programs?.some((program) => normalize(program) === normalize(filters.program))
      ) {
        return false;
      }

      return true;
    });
  }

  async getById(id) {
    const universities = await universitiesStore.read([]);
    return universities.find((university) => university.id === id) ?? null;
  }

  async create(input) {
    const errors = validateUniversity(input);

    if (errors.length > 0) {
      const error = new Error("Invalid university payload.");
      error.statusCode = 400;
      error.details = errors;
      throw error;
    }

    const universities = await universitiesStore.read([]);
    const baseId = toSlug(input.id || input.name) || crypto.randomUUID();
    let id = baseId;
    let suffix = 2;

    while (universities.some((university) => university.id === id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    const university = {
      id,
      ...sanitizeUniversity(input)
    };

    universities.push(university);
    await universitiesStore.write(universities);
    return university;
  }

  async update(id, input) {
    const errors = validateUniversity(input);

    if (errors.length > 0) {
      const error = new Error("Invalid university payload.");
      error.statusCode = 400;
      error.details = errors;
      throw error;
    }

    const universities = await universitiesStore.read([]);
    const index = universities.findIndex((university) => university.id === id);

    if (index === -1) {
      return null;
    }

    const university = {
      id,
      ...sanitizeUniversity(input)
    };

    universities[index] = university;
    await universitiesStore.write(universities);
    return university;
  }

  async patch(id, input) {
    const errors = validateUniversity(input, true);

    if (errors.length > 0) {
      const error = new Error("Invalid university payload.");
      error.statusCode = 400;
      error.details = errors;
      throw error;
    }

    const universities = await universitiesStore.read([]);
    const index = universities.findIndex((university) => university.id === id);

    if (index === -1) {
      return null;
    }

    const university = {
      id,
      ...mergeUniversity(universities[index], input)
    };

    universities[index] = university;
    await universitiesStore.write(universities);
    return university;
  }

  async delete(id) {
    const universities = await universitiesStore.read([]);
    const nextUniversities = universities.filter((university) => university.id !== id);

    if (nextUniversities.length === universities.length) {
      return false;
    }

    await universitiesStore.write(nextUniversities);
    return true;
  }
}

module.exports = new UniversityService();
