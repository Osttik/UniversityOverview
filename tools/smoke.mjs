import { spawn } from 'node:child_process';

const port = 3131;
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['dist/backend/main.js'], {
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
  const health = await (await fetchWithRetry('/api/health')).json();
  if (health.status !== 'ok') {
    throw new Error('Health endpoint did not return ok status');
  }

  const universities = await (await fetchWithRetry('/api/universities')).json();
  if (!Array.isArray(universities) || universities.length === 0) {
    throw new Error('Universities endpoint returned no records');
  }

  const html = await (await fetchWithRetry('/')).text();
  if (!html.includes('app-root')) {
    throw new Error('Frontend shell was not served from NestJS');
  }

  console.log('Smoke path passed: frontend shell, health API, and university data API are reachable.');
} finally {
  server.kill('SIGTERM');
}
