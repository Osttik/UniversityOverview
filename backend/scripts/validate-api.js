import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { loadCatalog } from '../src/dataStore.js';

const catalog = await loadCatalog();

assert.equal(catalog.universities.length > 0, true, 'universities data should not be empty');
assert.equal(catalog.faculties.length > 0, true, 'faculties data should not be empty');
assert.equal(catalog.campuses.length > 0, true, 'campuses data should not be empty');
assert.equal(catalog.programs.length > 0, true, 'programs data should not be empty');

for (const faculty of catalog.faculties) {
  assert.ok(catalog.universities.some((university) => university.id === faculty.universityId), `faculty ${faculty.id} has a valid university`);
}

for (const campus of catalog.campuses) {
  assert.ok(catalog.universities.some((university) => university.id === campus.universityId), `campus ${campus.id} has a valid university`);
}

for (const program of catalog.programs) {
  assert.ok(catalog.universities.some((university) => university.id === program.universityId), `program ${program.id} has a valid university`);
  assert.ok(catalog.faculties.some((faculty) => faculty.id === program.facultyId), `program ${program.id} has a valid faculty`);
  assert.ok(catalog.campuses.some((campus) => campus.id === program.campusId), `program ${program.id} has a valid campus`);
}

const app = createApp();
const server = app.listen(0);
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

try {
  const universities = await getJson(`${baseUrl}/api/universities`);
  assert.equal(universities.items.length, catalog.universities.length);
  assert.equal(universities.meta.total, catalog.universities.length);

  const universityDetail = await getJson(`${baseUrl}/api/universities/knu`);
  assert.equal(universityDetail.id, 'knu');
  assert.equal(Array.isArray(universityDetail.programs), true);

  const genericDetail = await getJson(`${baseUrl}/api/details/programs/kpi-ai-msc`);
  assert.equal(genericDetail.id, 'kpi-ai-msc');
  assert.equal(genericDetail.university.id, 'kpi');

  const programs = await getJson(`${baseUrl}/api/programs?degree=Master&language=English`);
  assert.equal(programs.items.every((program) => program.degree === 'Master' && program.language === 'English'), true);

  const filters = await getJson(`${baseUrl}/api/filters`);
  assert.ok(filters.degrees.includes('Bachelor'));
  assert.ok(filters.languages.includes('English'));

  const search = await getJson(`${baseUrl}/api/search?q=engineering`);
  assert.equal(search.meta.total > 0, true);
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

console.log('API validation passed');

async function getJson(url) {
  const response = await fetch(url);
  assert.equal(response.ok, true, `${url} should return ${response.status}`);
  return response.json();
}
