import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Zod validation middleware factory.
 * Validates request body, query, or params against a Zod schema.
 * Strips unknown fields by default (defense against mass-assignment).
 * Returns structured 400 errors with field-level details.
 */
export function validate(
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req[source]);
      // Replace with parsed + stripped data (removes unknown fields)
      (req as any)[source] = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
          code: e.code,
        }));

        res.status(400).json({
          error: "Validation failed",
          details: fieldErrors,
        });
        return;
      }
      next(error);
    }
  };
}
