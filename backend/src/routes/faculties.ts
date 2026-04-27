import { Router } from "express";

import { HttpError } from "../errors/http-error.js";
import { type AcademicCatalogService } from "../services/academic-catalog-service.js";

export function createFacultiesRouter(service: AcademicCatalogService) {
  const router = Router();

  router.get("/", async (_request, response, next) => {
    try {
      const faculties = await service.listFaculties();
      response.json({ data: faculties, count: faculties.length });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (request, response, next) => {
    try {
      const faculty = await service.findFacultyById(request.params.id);

      if (!faculty) {
        throw new HttpError(404, "Faculty was not found.", { code: "FACULTY_NOT_FOUND" });
      }

      response.json({ data: faculty });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/programs", async (request, response, next) => {
    try {
      const faculty = await service.findFacultyById(request.params.id);

      if (!faculty) {
        throw new HttpError(404, "Faculty was not found.", { code: "FACULTY_NOT_FOUND" });
      }

      const programs = await service.listPrograms({ facultyId: request.params.id });
      response.json({ data: programs, count: programs.length });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (request, response, next) => {
    try {
      const faculty = await service.createFaculty(request.body);
      response.status(201).json({ data: faculty });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (request, response, next) => {
    try {
      const faculty = await service.updateFaculty(request.params.id, request.body);

      if (!faculty) {
        throw new HttpError(404, "Faculty was not found.", { code: "FACULTY_NOT_FOUND" });
      }

      response.json({ data: faculty });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id", async (request, response, next) => {
    try {
      const faculty = await service.updateFaculty(request.params.id, request.body);

      if (!faculty) {
        throw new HttpError(404, "Faculty was not found.", { code: "FACULTY_NOT_FOUND" });
      }

      response.json({ data: faculty });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (request, response, next) => {
    try {
      const deleted = await service.deleteFaculty(request.params.id);

      if (!deleted) {
        throw new HttpError(404, "Faculty was not found.", { code: "FACULTY_NOT_FOUND" });
      }

      response.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
