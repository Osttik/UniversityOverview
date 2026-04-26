import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'data');

const fileMap = {
  campuses: 'campuses.json',
  faculties: 'faculties.json',
  programs: 'programs.json',
  universities: 'universities.json'
};

let cache;

async function readJson(name) {
  const content = await readFile(path.join(dataDir, fileMap[name]), 'utf8');
  return JSON.parse(content);
}

export async function loadCatalog() {
  if (!cache) {
    const [universities, faculties, campuses, programs] = await Promise.all([
      readJson('universities'),
      readJson('faculties'),
      readJson('campuses'),
      readJson('programs')
    ]);

    cache = Object.freeze({
      universities,
      faculties,
      campuses,
      programs
    });
  }

  return cache;
}
