const { createId, readData, writeData } = require("./dataStore");

function normalizeProgramPayload(payload) {
  return {
    facultyId: typeof payload.facultyId === "string" ? payload.facultyId.trim() : "",
    name: typeof payload.name === "string" ? payload.name.trim() : "",
    degree: typeof payload.degree === "string" ? payload.degree.trim() : "",
    durationYears: Number(payload.durationYears),
    description: typeof payload.description === "string" ? payload.description.trim() : ""
  };
}

function validateProgram(payload, partial = false) {
  const normalized = normalizeProgramPayload(payload);
  const errors = [];

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "facultyId")) {
    if (!normalized.facultyId) {
      errors.push("facultyId is required");
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "name")) {
    if (!normalized.name) {
      errors.push("name is required");
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "degree")) {
    if (!normalized.degree) {
      errors.push("degree is required");
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "durationYears")) {
    if (!Number.isInteger(normalized.durationYears) || normalized.durationYears <= 0) {
      errors.push("durationYears must be a positive integer");
    }
  }

  return { errors, normalized };
}

function publicProgram(program, faculties) {
  const faculty = faculties.find((item) => item.id === program.facultyId);

  return {
    ...program,
    facultyName: faculty ? faculty.name : null
  };
}

async function listPrograms(filters = {}) {
  const data = await readData();
  const programs = filters.facultyId
    ? data.programs.filter((program) => program.facultyId === filters.facultyId)
    : data.programs;

  return programs.map((program) => publicProgram(program, data.faculties));
}

async function getProgram(id) {
  const data = await readData();
  const program = data.programs.find((item) => item.id === id);

  return program ? publicProgram(program, data.faculties) : null;
}

async function createProgram(payload) {
  const { errors, normalized } = validateProgram(payload);

  if (errors.length > 0) {
    const err = new Error(errors.join(", "));
    err.status = 400;
    throw err;
  }

  const data = await readData();
  const facultyExists = data.faculties.some((faculty) => faculty.id === normalized.facultyId);

  if (!facultyExists) {
    const err = new Error("facultyId does not reference an existing faculty");
    err.status = 400;
    throw err;
  }

  const program = {
    id: createId("program", data.programs),
    ...normalized
  };

  data.programs.push(program);
  await writeData(data);

  return publicProgram(program, data.faculties);
}

async function updateProgram(id, payload) {
  const { errors, normalized } = validateProgram(payload, true);

  if (errors.length > 0) {
    const err = new Error(errors.join(", "));
    err.status = 400;
    throw err;
  }

  const data = await readData();
  const index = data.programs.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "facultyId")) {
    const facultyExists = data.faculties.some((faculty) => faculty.id === normalized.facultyId);

    if (!facultyExists) {
      const err = new Error("facultyId does not reference an existing faculty");
      err.status = 400;
      throw err;
    }
  }

  const nextProgram = { ...data.programs[index] };

  for (const [key, value] of Object.entries(normalized)) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      nextProgram[key] = value;
    }
  }

  data.programs[index] = nextProgram;
  await writeData(data);

  return publicProgram(nextProgram, data.faculties);
}

async function deleteProgram(id) {
  const data = await readData();
  const index = data.programs.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  data.programs.splice(index, 1);
  await writeData(data);

  return true;
}

module.exports = {
  createProgram,
  deleteProgram,
  getProgram,
  listPrograms,
  updateProgram
};
