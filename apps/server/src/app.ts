import cors from "cors";
import express from "express";
import type { ErrorRequestHandler, RequestHandler } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import morgan from "morgan";
import { createHealthRouter } from "./routes/health.js";
import { createUniversitiesRouter } from "./routes/universities.js";
import { JsonRepository } from "./storage/JsonRepository.js";
import type { University } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultDataDir = path.resolve(__dirname, "../data");

export interface CreateAppOptions {
  dataDir?: string;
  universitiesRepository?: JsonRepository<University>;
}

export interface HttpError extends Error {
  code?: string;
  status?: number;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const dataDir = options.dataDir ?? defaultDataDir;
  const universities =
    options.universitiesRepository ??
    new JsonRepository<University>({
      filePath: path.join(dataDir, "universities.json"),
      idField: "id"
    });

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.use("/api/health", createHealthRouter());
  app.use("/health", createHealthRouter());
  app.use("/api/universities", createUniversitiesRouter({ universities }));

  app.use((_request, response) => {
    response.status(404).json({
      error: {
        code: "not_found",
        message: "Route not found"
      }
    });
  });

  app.use(errorHandler);

  return app;
}

const errorHandler: ErrorRequestHandler = (error: HttpError, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (isJsonParseError(error)) {
    response.status(400).json({
      error: {
        code: "invalid_json",
        message: "Request body must be valid JSON"
      }
    });
    return;
  }

  const status = Number.isInteger(error.status) ? Number(error.status) : 500;
  response.status(status).json({
    error: {
      code: error.code ?? "internal_error",
      message: status >= 500 ? "Unexpected server error" : error.message
    }
  });
};

function isJsonParseError(error: Error): boolean {
  return "type" in error && error.type === "entity.parse.failed";
}

export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}
