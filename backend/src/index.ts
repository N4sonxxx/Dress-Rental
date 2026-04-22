import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";

import { generalLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import logger from "./utils/logger";

import authRoutes from "./routes/auth";
import dressRoutes from "./routes/dresses";
import bookingRoutes from "./routes/bookings";
import availabilityRoutes from "./routes/availability";
import adminRoutes from "./routes/admin";

const app = express();

// ── Security Headers (Helmet) ────────────────────────────────
// Sets 11+ HTTP security headers including CSP, X-Frame-Options,
// X-Content-Type-Options, Strict-Transport-Security, etc.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow image loading
  })
);

// ── CORS ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Required for httpOnly cookies
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Parsers & Compression ────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());

// ── Rate Limiting (global) ───────────────────────────────────
app.use(generalLimiter);

// Since we use Supabase for file storage, local disk uploads are disabled.
// Vercel serverless functions have a read-only filesystem, so creating ./uploads would crash the app.
// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/dresses", dressRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/admin", adminRoutes);

// ── 404 Handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ── Start Server (local dev only) ────────────────────────────
// Vercel automatically sets the VERCEL env var. When running on Vercel
// we must NOT call app.listen() — the platform handles that itself.
if (!process.env.VERCEL) {
  const PORT = parseInt(process.env.PORT || "4000", 10);
  app.listen(PORT, () => {
    logger.info(`GlamourRent API running on port ${PORT}`, {
      env: process.env.NODE_ENV || "development",
      cors: process.env.FRONTEND_URL || "http://localhost:3000",
    });
  });
}

// Export the app for Vercel Serverless Function compatibility
export default app;
module.exports = app;
