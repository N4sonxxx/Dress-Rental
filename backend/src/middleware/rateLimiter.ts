import rateLimit from "express-rate-limit";
import logger from "../utils/logger";

/**
 * General API rate limiter — 100 requests per 15 minutes per IP.
 * Returns structured JSON error (not HTML) for API consumers.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    logger.warn("Rate limit exceeded", {
      ip: _req.ip,
      path: _req.path,
      limiter: "general",
    });
    res.status(429).json({
      error: "Too many requests",
      message: "Please try again later.",
      retryAfter: 15 * 60,
    });
  },
});

/**
 * Auth endpoint rate limiter — 5 attempts per 15 minutes per IP.
 * Protects against brute-force and credential stuffing attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    logger.warn("Auth rate limit exceeded — potential brute force", {
      ip: _req.ip,
      path: _req.path,
      limiter: "auth",
    });
    res.status(429).json({
      error: "Too many login attempts",
      message: "Account temporarily locked. Try again in 15 minutes.",
      retryAfter: 15 * 60,
    });
  },
});

/**
 * Booking creation rate limiter — 20 bookings per 15 minutes per IP.
 * Prevents booking spam and abuse.
 */
export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    logger.warn("Booking rate limit exceeded", {
      ip: _req.ip,
      path: _req.path,
      limiter: "booking",
    });
    res.status(429).json({
      error: "Too many booking requests",
      message: "Please wait before creating more bookings.",
      retryAfter: 15 * 60,
    });
  },
});
