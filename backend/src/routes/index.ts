import { Router } from "express";

import { healthRouter } from "./health.js";
import { createUniversityRouter } from "./universities.js";

export const apiRouter = Router();

apiRouter.get("/", (_request, response) => {
  response.json({
    name: "University Overview API",
    status: "ready"
  });
});

apiRouter.use("/health", healthRouter);
apiRouter.use("/universities", createUniversityRouter());
