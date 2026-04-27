const { createId, readData, writeData } = require("./dataStore");

function normalizeFacultyPayload(payload) {
  return {
    name: typeof payload.name === "string" ? payload.name.trim() : "",
    description: typeof payload.description === "string" ? payload.description.trim() : "",
    dean: typeof payload.dean === "string" ? payload.dean.trim() : ""
  };
}

function validateFaculty(payload, partial = false) {
  const normalized = normalizeFacultyPayload(payload);
  const errors = [];

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "name")) {
    if (!normalized.name) {
      errors.push("name is required");
    }
  }

  return { errors, normalized };
}

function publicFaculty(faculty, programs) {
  const programCount = programs.filter((program) => program.facultyId === faculty.id).length;

  return {
    ...faculty,
    programCount
  };
}

async function listFaculties() {
  const data = await readData();
  return data.faculties.map((faculty) => publicFaculty(faculty, data.programs));
}

async function getFaculty(id) {
  const data = await readData();
  const faculty = data.faculties.find((item) => item.id === id);

  return faculty ? publicFaculty(faculty, data.programs) : null;
}

async function createFaculty(payload) {
  const { errors, normalized } = validateFaculty(payload);

  if (errors.length > 0) {
    const err = new Error(errors.join(", "));
    err.status = 400;
    throw err;
  }

  const data = await readData();
  const faculty = {
    id: createId("faculty", data.faculties),
    ...normalized
  };

  data.faculties.push(faculty);
  await writeData(data);

  return publicFaculty(faculty, data.programs);
}

async function updateFaculty(id, payload) {
  const { errors, normalized } = validateFaculty(payload, true);

  if (errors.length > 0) {
    const err = new Error(errors.join(", "));
    err.status = 400;
    throw err;
  }

  const data = await readData();
  const index = data.faculties.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const nextFaculty = { ...data.faculties[index] };

  for (const [key, value] of Object.entries(normalized)) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      nextFaculty[key] = value;
    }
  }

  data.faculties[index] = nextFaculty;
  await writeData(data);

  return publicFaculty(nextFaculty, data.programs);
}

async function deleteFaculty(id) {
  const data = await readData();
  const index = data.faculties.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  const hasPrograms = data.programs.some((program) => program.facultyId === id);

  if (hasPrograms) {
    const err = new Error("Faculty cannot be deleted while programs reference it");
    err.status = 409;
    throw err;
  }

  data.faculties.splice(index, 1);
  await writeData(data);

  return true;
}

module.exports = {
  createFaculty,
  deleteFaculty,
  getFaculty,
  listFaculties,
  updateFaculty
};
