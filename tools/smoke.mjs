import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const port = 3131;
const baseUrl = `http://127.0.0.1:${port}`;
const webIndexCandidates = [
  'dist/apps/web/browser/index.html',
  'dist/apps/web/index.html'
];

const webIndexPath = webIndexCandidates.find((candidate) => existsSync(candidate));
if (!webIndexPath) {
  throw new Error('Built Angular index was not found. Run npm run build before smoke.');
}

const webIndex = readFileSync(webIndexPath, 'utf8');
if (!webIndex.includes('uo-root')) {
  throw new Error('Built Angular index does not contain the application root element.');
}

const server = spawn(process.execPath, ['dist/apps/api/main.js'], {
  env: {
    ...process.env,
    PORT: String(port)
  },
  stdio: ['ignore', 'pipe', 'pipe']
});

let serverLog = '';
server.stdout.on('data', (chunk) => {
  serverLog += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  serverLog += chunk.toString();
});

async function fetchWithRetry(path, attempts = 30) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}${path}`);
      if (response.ok) {
        return response;
      }

      lastError = new Error(`${path} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
  }

  throw lastError;
}

try {
  const universities = await (await fetchWithRetry('/api/universities')).json();
  if (!Array.isArray(universities) || universities.length === 0) {
    throw new Error('Universities endpoint returned no records.');
  }

  console.log('Smoke path passed: built Angular shell and JSON universities API are reachable.');
} catch (error) {
  if (serverLog.trim()) {
    console.error(serverLog.trim());
  }

  throw error;
} finally {
  server.kill('SIGTERM');
}
