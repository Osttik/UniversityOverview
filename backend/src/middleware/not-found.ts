import type { RequestHandler } from "express";

import { HttpError } from "../errors/http-error.js";

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(
    new HttpError(404, `Route ${request.method} ${request.originalUrl} was not found`, {
      code: "ROUTE_NOT_FOUND"
    })
  );
};
