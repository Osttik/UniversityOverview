import { Router } from "express";

import { HttpError } from "../errors/http-error.js";
import { type AcademicCatalogService } from "../services/academic-catalog-service.js";

export function createProgramsRouter(service: AcademicCatalogService) {
  const router = Router();

  router.get("/", async (request, response, next) => {
    try {
      const programs = await service.listPrograms({ facultyId: singleQueryValue(request.query.facultyId) });
      response.json({ data: programs, count: programs.length });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (request, response, next) => {
    try {
      const program = await service.findProgramById(request.params.id);

      if (!program) {
        throw new HttpError(404, "Program was not found.", { code: "PROGRAM_NOT_FOUND" });
      }

      response.json({ data: program });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (request, response, next) => {
    try {
      const program = await service.createProgram(request.body);
      response.status(201).json({ data: program });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (request, response, next) => {
    try {
      const program = await service.updateProgram(request.params.id, request.body);

      if (!program) {
        throw new HttpError(404, "Program was not found.", { code: "PROGRAM_NOT_FOUND" });
      }

      response.json({ data: program });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id", async (request, response, next) => {
    try {
      const program = await service.updateProgram(request.params.id, request.body);

      if (!program) {
        throw new HttpError(404, "Program was not found.", { code: "PROGRAM_NOT_FOUND" });
      }

      response.json({ data: program });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (request, response, next) => {
    try {
      const deleted = await service.deleteProgram(request.params.id);

      if (!deleted) {
        throw new HttpError(404, "Program was not found.", { code: "PROGRAM_NOT_FOUND" });
      }

      response.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function singleQueryValue(value: unknown) {
  return Array.isArray(value) ? String(value[0] ?? "") : value === undefined ? undefined : String(value);
}
