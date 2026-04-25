# Manual Smoke Path

1. Run `npm run build`.
2. Run `node tools/smoke.mjs` to confirm the built Angular shell exists and the compiled Nest API serves university data.
3. Run `npm run start:api` and open `http://localhost:3000/api/universities`; confirm it returns the JSON-backed university list.
4. Serve `dist/apps/web/browser` from any localhost static host, such as `http://localhost:8080`. The built Angular app automatically targets `http://localhost:3000/api` when it is opened from a localhost port other than `3000`, so the dashboard can load data from the separately running Nest API.
5. Confirm the university dashboard renders with cards, filters, campus map controls, and image assets.

For a non-localhost static host, set `window.__UNIVERSITY_OVERVIEW_CONFIG__ = { apiBaseUrl: 'http://localhost:3000/api' }` before the Angular bundle loads, or serve the API behind the same origin at `/api`.
