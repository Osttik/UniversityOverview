import { Router } from "express";
import { asyncHandler } from "../app.js";
import { validateBody } from "../validation.js";
import type { JsonRepository } from "../storage/JsonRepository.js";
import type { University } from "../types.js";

const universitySchema = {
  name: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 160
  },
  city: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 120
  },
  country: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 120
  },
  students: {
    type: "integer",
    required: true,
    min: 0
  },
  programs: {
    type: "stringArray",
    required: true,
    minItems: 1,
    maxItems: 50,
    maxLength: 120
  },
  founded: {
    type: "integer",
    required: true,
    min: 1000,
    max: new Date().getFullYear()
  },
  website: {
    type: "url",
    maxLength: 300
  },
  description: {
    type: "string",
    maxLength: 2000
  }
} as const;

const universityUpdateSchema = Object.fromEntries(
  Object.entries(universitySchema).map(([key, rules]) => [key, { ...rules, required: false }])
);

interface CreateUniversitiesRouterOptions {
  universities: JsonRepository<University>;
}

export function createUniversitiesRouter({ universities }: CreateUniversitiesRouterOptions) {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      response.json({ data: await universities.list() });
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (request, response) => {
      const university = await universities.getById(request.params.id);
      if (!university) {
        response.status(404).json({
          error: {
            code: "university_not_found",
            message: "University was not found"
          }
        });
        return;
      }

      response.json({ data: university });
    })
  );

  router.post(
    "/",
    validateBody<Partial<University>>(universitySchema),
    asyncHandler(async (request, response) => {
      const university = await universities.create(request.body as University);
      response.status(201).json({ data: university });
    })
  );

  router.put(
    "/:id",
    validateBody<Partial<University>>(universityUpdateSchema, { requireAtLeastOne: true }),
    asyncHandler(async (request, response) => {
      const university = await universities.update(request.params.id, request.body);
      if (!university) {
        response.status(404).json({
          error: {
            code: "university_not_found",
            message: "University was not found"
          }
        });
        return;
      }

      response.json({ data: university });
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (request, response) => {
      const removed = await universities.remove(request.params.id);
      if (!removed) {
        response.status(404).json({
          error: {
            code: "university_not_found",
            message: "University was not found"
          }
        });
        return;
      }

      response.status(204).send();
    })
  );

  return router;
}
