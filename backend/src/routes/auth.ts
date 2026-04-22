import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiter";
import { loginSchema } from "../schemas";
import prisma from "../utils/prisma";
import logger from "../utils/logger";

const router = Router();

const BCRYPT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

/**
 * POST /api/auth/login
 * Rate-limited: 5 attempts per 15 minutes.
 * Returns JWT in httpOnly cookie — NOT in response body.
 */
router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const admin = await prisma.admin.findUnique({ where: { email } });

      // Constant-time comparison: always hash even if user not found
      // Prevents timing attacks that reveal valid emails
      if (!admin) {
        await bcrypt.hash("dummy-password-for-timing", BCRYPT_ROUNDS);
        logger.warn("Login attempt for non-existent email", {
          email,
          ip: req.ip,
        });
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const validPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!validPassword) {
        logger.warn("Failed login attempt", { email, ip: req.ip });
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as any,
      });

      // Set httpOnly cookie — not accessible via JavaScript (XSS protection)
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
        path: "/",
      });

      logger.info("Successful login", { email, ip: req.ip });

      res.json({
        message: "Login successful",
        admin: { id: admin.id, email: admin.email },
      });
    } catch (error) {
      logger.error("Login error", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/auth/logout
 * Clears the auth cookie.
 */
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Logged out" });
});

/**
 * GET /api/auth/me
 * Returns current admin info if authenticated.
 * Used by frontend to check auth state.
 */
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string };
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, email: true },
    });

    if (!admin) {
      res.status(401).json({ error: "Admin not found" });
      return;
    }

    res.json({ admin });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
