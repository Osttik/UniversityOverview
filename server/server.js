import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataPath = path.join(rootDir, 'data', 'campus.json');
const mapImagePath = path.join(rootDir, 'UniversityProgramm', 'Images', '1.1.jpg');
const distDir = path.join(rootDir, 'dist');

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/campus', async (_request, response, next) => {
  try {
    const campus = await readFile(dataPath, 'utf8');
    response.type('application/json').send(campus);
  } catch (error) {
    next(error);
  }
});

app.get('/api/campus/map-image', (_request, response) => {
  response.sendFile(mapImagePath);
});

app.use(express.static(distDir));

app.get('*', (_request, response) => {
  response.sendFile(path.join(distDir, 'index.html'));
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'Unable to load campus map data.' });
});

app.listen(port, () => {
  console.log(`University overview server listening on http://127.0.0.1:${port}`);
});
