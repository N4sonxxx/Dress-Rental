import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

export interface AuthRequest extends Request {
  adminId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * JWT authentication middleware.
 * Reads token from httpOnly cookie (preferred) or Authorization header (fallback).
 * Never stores tokens in localStorage — cookies with httpOnly + Secure + SameSite.
 */
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  // Prefer httpOnly cookie, fall back to Authorization header
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    logger.warn("Unauthorized access attempt", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!JWT_SECRET) {
    logger.error("JWT_SECRET not configured — server misconfiguration");
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string };
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.info("Expired token used", { ip: req.ip, path: req.path });
      res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
      return;
    }
    logger.warn("Invalid token used", { ip: req.ip, path: req.path });
    res.status(401).json({ error: "Invalid token" });
    return;
  }
}
