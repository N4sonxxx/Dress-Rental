import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

/**
 * Global error handler.
 * - Never leaks stack traces in production
 * - Logs full error details server-side
 * - Returns structured JSON errors for API consumers
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: _req.path,
    method: _req.method,
    ip: _req.ip,
  });

  const isDev = process.env.NODE_ENV === "development";

  res.status(500).json({
    error: "Internal server error",
    // Only show details in development — never in production
    ...(isDev && { message: err.message, stack: err.stack }),
  });
}
