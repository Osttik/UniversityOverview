import path from "node:path";
import { fileURLToPath } from "node:url";

import { Router } from "express";

import { HttpError } from "../errors/http-error.js";
import { JsonUniversityRepository } from "../persistence/university-repository.js";

const dataFilePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../data/universities.json");
const defaultRepository = new JsonUniversityRepository(dataFilePath);

export function createUniversityRouter(repository = defaultRepository) {
  const router = Router();

  router.get("/", async (_request, response, next) => {
    try {
      response.json({ data: await repository.list() });
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
