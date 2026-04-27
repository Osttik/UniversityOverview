import { Router } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { AcademicCatalogService } from "../services/academic-catalog-service.js";
import { UniversityOverviewService } from "../services/university-overview-service.js";
import { createDetailPagesRouter } from "./detail-pages.js";
import { createFacultiesRouter } from "./faculties.js";
import { healthRouter } from "./health.js";
import { createProgramsRouter } from "./programs.js";
import { createUniversityRouter, defaultUniversityRepository } from "./universities.js";

export const apiRouter = Router();
const academicsDataFilePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../data/academics.json");
const academicCatalogService = new AcademicCatalogService(academicsDataFilePath);
const universityOverviewService = new UniversityOverviewService(defaultUniversityRepository, academicCatalogService);

apiRouter.get("/", (_request, response) => {
  response.json({
    name: "University Overview API",
    status: "ready"
  });
});

apiRouter.use("/health", healthRouter);
apiRouter.use("/detail-pages", createDetailPagesRouter(universityOverviewService));
apiRouter.use("/universities", createUniversityRouter(defaultUniversityRepository, universityOverviewService));
apiRouter.use("/faculties", createFacultiesRouter(academicCatalogService));
apiRouter.use("/programs", createProgramsRouter(academicCatalogService));
