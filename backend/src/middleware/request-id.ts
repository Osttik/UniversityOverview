import { randomUUID } from "node:crypto";

import type { RequestHandler } from "express";

export const requestId: RequestHandler = (request, response, next) => {
  const existingRequestId = request.header("x-request-id");
  const id = existingRequestId && existingRequestId.trim().length > 0 ? existingRequestId : randomUUID();

  response.locals.requestId = id;
  response.setHeader("x-request-id", id);
  next();
};
