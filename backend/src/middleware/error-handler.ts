import type { ErrorRequestHandler } from "express";

import { env } from "../config/env.js";
import { isHttpError } from "../errors/http-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const statusCode = isHttpError(error) ? error.statusCode : 500;
  const code = isHttpError(error) ? error.code : "INTERNAL_SERVER_ERROR";
  const message = isHttpError(error) && error.expose ? error.message : "Internal server error";
  const requestId = response.locals.requestId as string | undefined;
  const details = isHttpError(error) && error.expose ? error.details : undefined;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    error: {
      code,
      message,
      statusCode,
      requestId,
      ...(details ? { details } : {}),
      ...(env.nodeEnv === "development" ? { stack: error instanceof Error ? error.stack : undefined } : {})
    }
  });
};
