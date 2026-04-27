import { Router } from "express";

import { HttpError } from "../errors/http-error.js";
import { type UniversityOverviewService } from "../services/university-overview-service.js";

export function createDetailPagesRouter(overviewService: UniversityOverviewService) {
  const router = Router();

  router.get("/:key/overview", async (request, response, next) => {
    try {
      const overview = await overviewService.findByUniversityKey(request.params.key);

      if (!overview) {
        throw new HttpError(404, "University was not found.", { code: "UNIVERSITY_NOT_FOUND" });
      }

      response.json({ data: overview });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
