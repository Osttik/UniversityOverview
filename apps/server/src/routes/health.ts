import { Router } from "express";

export function createHealthRouter() {
  const router = Router();

  router.get("/", (_request, response) => {
    response.status(200).json({
      status: "ok",
      service: "university-overview-api",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  return router;
}
