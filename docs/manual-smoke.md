# Manual Smoke Path

1. Run `npm run build`.
2. Run `node tools/smoke.mjs` to confirm the built Angular shell exists and the compiled Nest API serves university data.
3. Run `npm run start:api` and open `http://localhost:3000/api/universities`; confirm it returns the JSON-backed university list.
4. Serve `dist/apps/web/browser` with a static host and confirm the university dashboard renders with cards, filters, campus map controls, and image assets.
