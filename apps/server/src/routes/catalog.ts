import { Router } from "express";
import type { Request, Response } from "express";
import { asyncHandler } from "../app.js";
import type { CatalogService } from "../catalogService.js";

interface CreateCatalogRouterOptions {
  catalog: CatalogService;
}

export function createCatalogRouter({ catalog }: CreateCatalogRouterOptions) {
  const router = Router();

  router.get(
    "/universities",
    asyncHandler(async (request, response) => {
      response.json(await catalog.listUniversities(toCatalogQuery(request)));
    })
  );

  router.get(
    "/universities/:id",
    asyncHandler(async (request, response) => {
      sendDetail(response, await catalog.getUniversityDetail(request.params.id), "University");
    })
  );

  router.get(
    "/faculties",
    asyncHandler(async (request, response) => {
      response.json(await catalog.listFaculties(toCatalogQuery(request)));
    })
  );

  router.get(
    "/faculties/:id",
    asyncHandler(async (request, response) => {
      sendDetail(response, await catalog.getFacultyDetail(request.params.id), "Faculty");
    })
  );

  router.get(
    "/campuses",
    asyncHandler(async (request, response) => {
      response.json(await catalog.listCampuses(toCatalogQuery(request)));
    })
  );

  router.get(
    "/campuses/:id",
    asyncHandler(async (request, response) => {
      sendDetail(response, await catalog.getCampusDetail(request.params.id), "Campus");
    })
  );

  router.get(
    "/programs",
    asyncHandler(async (request, response) => {
      response.json(await catalog.listPrograms(toCatalogQuery(request)));
    })
  );

  router.get(
    "/programs/:id",
    asyncHandler(async (request, response) => {
      sendDetail(response, await catalog.getProgramDetail(request.params.id), "Program");
    })
  );

  router.get(
    "/filters",
    asyncHandler(async (_request, response) => {
      response.json(await catalog.getFilters());
    })
  );

  router.get(
    "/search",
    asyncHandler(async (request, response) => {
      response.json(await catalog.searchCatalog(toCatalogQuery(request)));
    })
  );

  router.get(
    "/details/:entity/:id",
    asyncHandler(async (request, response) => {
      sendDetail(response, await catalog.getDetail(request.params.entity, request.params.id), "Entity");
    })
  );

  return router;
}

function toCatalogQuery(request: Request): Record<string, string | string[] | undefined> {
  const query: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of Object.entries(request.query)) {
    if (Array.isArray(value)) {
      query[key] = value.map((item) => String(item));
    } else if (value !== undefined) {
      query[key] = String(value);
    }
  }

  return query;
}

function sendDetail(response: Response, entity: unknown, label: string) {
  if (!entity) {
    response.status(404).json({
      error: {
        code: "not_found",
        message: `${label} not found`
      }
    });
    return;
  }

  response.json({ data: entity });
}
