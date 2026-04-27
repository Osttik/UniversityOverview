import { Router } from "express";

import { healthRouter } from "./health.js";

export const apiRouter = Router();

apiRouter.get("/", (_request, response) => {
  response.json({
    name: "University Overview API",
    status: "ready"
  });
});

apiRouter.use("/health", healthRouter);
