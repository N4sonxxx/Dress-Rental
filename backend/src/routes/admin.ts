import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { securityVaultSchema, bookingIdParamSchema } from "../schemas";
import prisma from "../utils/prisma";
import logger from "../utils/logger";
import { supabase } from "../utils/supabase";

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

// ── Secure File Upload Configuration ─────────────────────────

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || "10") || 10) * 1024 * 1024;

const storage = multer.memoryStorage(); // Store files in memory for Supabase upload

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// Helper function to upload an image to Supabase
const uploadToSupabase = async (file: Express.Multer.File, folder: string): Promise<string> => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not properly configured");
  }

  const randomName = crypto.randomBytes(32).toString("hex");
  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `${folder}/${randomName}${ext}`;
  
  const { data, error } = await supabase.storage
    .from("glamourrent-vault") // The bucket name inside Supabase
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("glamourrent-vault")
    .getPublicUrl(filename);
    
  return publicUrlData.publicUrl;
};

// ── Admin Dashboard Data ─────────────────────────────────────

/**
 * GET /api/admin/dashboard
 * Returns summary data for admin dashboard.
 */
router.get(
  "/dashboard",
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [
        totalDresses,
        availableDresses,
        rentedDresses,
        pendingInspections,
        activeRentals,
        upcomingReturns,
        lateReturns,
      ] = await Promise.all([
        prisma.dress.count(),
        prisma.dress.count({ where: { status: "AVAILABLE" } }),
        prisma.dress.count({ where: { status: "RENTED" } }),
        prisma.booking.count({ where: { status: "PENDING" } }),
        prisma.booking.count({ where: { status: "ACTIVE" } }),
        prisma.booking.findMany({
          where: {
            status: "ACTIVE",
            endDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // next 3 days
            },
          },
          include: { dress: { select: { name: true } } },
          orderBy: { endDate: "asc" },
        }),
        prisma.booking.findMany({
          where: {
            status: "ACTIVE",
            endDate: { lt: new Date() },
          },
          include: {
            dress: { select: { name: true } },
          },
          orderBy: { endDate: "asc" },
        }),
      ]);

      res.json({
        inventory: { total: totalDresses, available: availableDresses, rented: rentedDresses },
        bookings: { pendingInspections, activeRentals },
        upcomingReturns,
        lateReturns,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  }
);

// ── Security Vault ───────────────────────────────────────────

/**
 * POST /api/admin/vault
 * Upload ID and face photos for a booking.
 * Files are stored with randomized names on Supabase Storage.
 */
router.post(
  "/vault",
  upload.fields([
    { name: "idPhoto", maxCount: 1 },
    { name: "facePhoto", maxCount: 1 },
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { bookingId, depositAmount } = req.body;

      // Validate required fields
      const parsed = securityVaultSchema.safeParse({
        bookingId,
        depositAmount: parseFloat(depositAmount),
      });

      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.errors,
        });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files?.idPhoto?.[0] || !files?.facePhoto?.[0]) {
        res.status(400).json({ error: "Both ID photo and face photo are required" });
        return;
      }

      // Verify booking exists
      const booking = await prisma.booking.findUnique({
        where: { id: parsed.data.bookingId },
      });

      if (!booking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }

      let idPhotoPath = "";
      let facePhotoPath = "";

      try {
        [idPhotoPath, facePhotoPath] = await Promise.all([
          uploadToSupabase(files.idPhoto[0], "vault-ids"),
          uploadToSupabase(files.facePhoto[0], "vault-faces"),
        ]);
      } catch (uploadError) {
        logger.error("Supabase file upload failed", { error: uploadError });
        res.status(500).json({ error: "Cloud storage upload failed" });
        return;
      }

      const vault = await prisma.securityVault.create({
        data: {
          bookingId: parsed.data.bookingId,
          idPhotoPath,
          facePhotoPath,
          depositAmount: parsed.data.depositAmount,
        },
      });

      logger.info("Security vault created", {
        vaultId: vault.id,
        bookingId: parsed.data.bookingId,
        adminId: req.adminId,
      });

      res.status(201).json({ vault: { id: vault.id, bookingId: vault.bookingId } });
    } catch (error) {
      logger.error("Vault creation failed", { error });
      res.status(500).json({ error: "Failed to create security vault" });
    }
  }
);

/**
 * GET /api/admin/vault/:id
 * Get security vault details (admin only — IDOR protected by requireAuth).
 */
router.get(
  "/vault/:id",
  validate(bookingIdParamSchema, "params"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const vault = await prisma.securityVault.findUnique({
        where: { id: String(req.params.id) },
        include: {
          booking: {
            select: {
              customerName: true,
              customerEmail: true,
              status: true,
            },
          },
        },
      });

      if (!vault) {
        res.status(404).json({ error: "Vault not found" });
        return;
      }

      res.json({ vault });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vault" });
    }
  }
);

export default router;
