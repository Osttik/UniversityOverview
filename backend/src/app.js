import cors from 'cors';
import express from 'express';
import {
  getCampusDetail,
  getFacultyDetail,
  getFilters,
  getProgramDetail,
  getUniversityDetail,
  listCampuses,
  listFaculties,
  listPrograms,
  listUniversities,
  searchCatalog
} from './catalogService.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/universities', asyncHandler(async (req, res) => {
    res.json(await listUniversities(req.query));
  }));

  app.get('/api/universities/:id', asyncHandler(async (req, res) => {
    sendDetail(res, await getUniversityDetail(req.params.id), 'University');
  }));

  app.get('/api/faculties', asyncHandler(async (req, res) => {
    res.json(await listFaculties(req.query));
  }));

  app.get('/api/faculties/:id', asyncHandler(async (req, res) => {
    sendDetail(res, await getFacultyDetail(req.params.id), 'Faculty');
  }));

  app.get('/api/campuses', asyncHandler(async (req, res) => {
    res.json(await listCampuses(req.query));
  }));

  app.get('/api/campuses/:id', asyncHandler(async (req, res) => {
    sendDetail(res, await getCampusDetail(req.params.id), 'Campus');
  }));

  app.get('/api/programs', asyncHandler(async (req, res) => {
    res.json(await listPrograms(req.query));
  }));

  app.get('/api/programs/:id', asyncHandler(async (req, res) => {
    sendDetail(res, await getProgramDetail(req.params.id), 'Program');
  }));

  app.get('/api/filters', asyncHandler(async (req, res) => {
    res.json(await getFilters());
  }));

  app.get('/api/search', asyncHandler(async (req, res) => {
    res.json(await searchCatalog(req.query));
  }));

  app.get('/api/details/:entity/:id', asyncHandler(async (req, res) => {
    const detail = await getDetail(req.params.entity, req.params.id);
    sendDetail(res, detail, 'Entity');
  }));

  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: 'not_found',
        message: 'Route not found'
      }
    });
  });

  app.use((error, req, res, next) => {
    const status = error.statusCode ?? 500;
    res.status(status).json({
      error: {
        code: status === 500 ? 'internal_error' : 'request_error',
        message: status === 500 ? 'Unexpected server error' : error.message
      }
    });
  });

  return app;
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function sendDetail(res, entity, label) {
  if (!entity) {
    res.status(404).json({
      error: {
        code: 'not_found',
        message: `${label} not found`
      }
    });
    return;
  }

  res.json(entity);
}

async function getDetail(entity, id) {
  switch (entity) {
    case 'campuses':
    case 'campus':
      return getCampusDetail(id);
    case 'faculties':
    case 'faculty':
      return getFacultyDetail(id);
    case 'programs':
    case 'program':
      return getProgramDetail(id);
    case 'universities':
    case 'university':
      return getUniversityDetail(id);
    default:
      return null;
  }
}
