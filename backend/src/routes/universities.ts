import path from "node:path";
import { fileURLToPath } from "node:url";

import { Router } from "express";

import { HttpError } from "../errors/http-error.js";
import { JsonUniversityRepository, type UniversityListFilters } from "../persistence/university-repository.js";
import { type UniversityOverviewService } from "../services/university-overview-service.js";

const dataFilePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../data/universities.json");
export const defaultUniversityRepository = new JsonUniversityRepository(dataFilePath);

export function createUniversityRouter(
  repository = defaultUniversityRepository,
  overviewService?: UniversityOverviewService
) {
  const router = Router();

  router.get("/", async (request, response, next) => {
    try {
      const universities = await repository.list(readListFilters(request.query));
      response.json({ data: universities, count: universities.length });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:key/overview", async (request, response, next) => {
    try {
      if (!overviewService) {
        throw new HttpError(500, "University overview service is not configured.", {
          code: "OVERVIEW_SERVICE_NOT_CONFIGURED",
          expose: false
        });
      }

      const overview = await overviewService.findByUniversityKey(request.params.key);

      if (!overview) {
        throw new HttpError(404, "University was not found.", { code: "UNIVERSITY_NOT_FOUND" });
      }

      response.json({ data: overview });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (request, response, next) => {
    try {
      const university = await repository.findById(request.params.id);

      if (!university) {
        throw new HttpError(404, "University was not found.", { code: "UNIVERSITY_NOT_FOUND" });
      }

      response.json({ data: university });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (request, response, next) => {
    try {
      const university = await repository.create(request.body);
      response.status(201).json({ data: university });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (request, response, next) => {
    try {
      const university = await repository.update(request.params.id, request.body);

      if (!university) {
        throw new HttpError(404, "University was not found.", { code: "UNIVERSITY_NOT_FOUND" });
      }

      response.json({ data: university });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id", async (request, response, next) => {
    try {
      const university = await repository.patch(request.params.id, request.body);

      if (!university) {
        throw new HttpError(404, "University was not found.", { code: "UNIVERSITY_NOT_FOUND" });
      }

      response.json({ data: university });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (request, response, next) => {
    try {
      const deleted = await repository.delete(request.params.id);

      if (!deleted) {
        throw new HttpError(404, "University was not found.", { code: "UNIVERSITY_NOT_FOUND" });
      }

      response.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function readListFilters(query: Record<string, unknown>): UniversityListFilters {
  return {
    search: singleQueryValue(query.search),
    country: singleQueryValue(query.country),
    city: singleQueryValue(query.city),
    program: singleQueryValue(query.program),
    status: singleQueryValue(query.status) as UniversityListFilters["status"]
  };
}

function singleQueryValue(value: unknown) {
  return Array.isArray(value) ? String(value[0] ?? "") : value === undefined ? undefined : String(value);
}
