# UniversityOverview

UniversityOverview is being reworked as a web application. The maintained direction is:

- Vue.js frontend
- Express.js backend
- Local JSON files for application data

The existing `UniversityProgramm` WPF/.NET project is legacy reference material only. It is superseded by the web app work and should not be used as the active runtime.

## Web App Setup

Use a current LTS version of Node.js and npm. The expected project layout for the web app is:

- `client/` - Vue application
- `server/` - Express API
- `server/data/` - local JSON data files

Install dependencies from each package directory:

```powershell
cd client
npm install
cd ../server
npm install
```

If a root workspace `package.json` is added later, prefer its root-level scripts when they wrap both apps.

## Development

Run the backend API and frontend dev server in separate terminals:

```powershell
cd server
npm run dev
```

```powershell
cd client
npm run dev
```

The frontend should call the Express API instead of reading JSON files directly. Keep environment-specific URLs in local environment files that are not committed.

## Build

Build the Vue frontend before packaging or deployment:

```powershell
cd client
npm run build
```

When the backend has a compile or typecheck script, run it before shipping changes:

```powershell
cd server
npm run build
```

## Start

Start the production Express API with:

```powershell
cd server
npm start
```

Serve the built frontend from the backend or from a static host, depending on the deployment setup chosen for the web app.

## Local JSON Data

Local JSON files are acceptable for this rework and should be treated as the web app database.

- Store data under `server/data/`.
- Keep JSON valid and consistently shaped so the API can parse it without migration logic.
- Read and write JSON through backend services only; the Vue app should use API endpoints.
- Do not commit generated caches, temporary exports, secrets, or machine-specific local data.
- If seed data is needed, keep it small and deterministic.

## Legacy WPF Project

`UniversityProgramm.sln` and the `UniversityProgramm/` folder contain the old WPF/.NET application. That code may be used to copy ideas, content, or interaction flows, but it is not the maintained application and should not be run as part of validating the web app.

Validate new work with the Vue, Express, and local JSON application commands instead.
