import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { bookingLimiter } from "../middleware/rateLimiter";
import {
  createBookingSchema,
  updateBookingStatusSchema,
  bookingIdParamSchema,
} from "../schemas";
import prisma from "../utils/prisma";
import logger from "../utils/logger";

const router = Router();

/**
 * POST /api/bookings
 * Public — create an inspection booking. Rate-limited.
 */
router.post(
  "/",
  bookingLimiter,
  validate(createBookingSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body;

      // Verify dress exists and is available
      const dress = await prisma.dress.findUnique({
        where: { id: data.dressId },
      });

      if (!dress || dress.status !== "AVAILABLE") {
        res.status(400).json({ error: "Dress is not available for booking" });
        return;
      }

      // Check for overlapping bookings
      const overlap = await prisma.booking.findFirst({
        where: {
          dressId: data.dressId,
          status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
          OR: [
            {
              startDate: { lte: new Date(data.endDate) },
              endDate: { gte: new Date(data.startDate) },
            },
          ],
        },
      });

      if (overlap) {
        res.status(409).json({
          error: "Dress is already booked for the selected dates",
        });
        return;
      }

      const booking = await prisma.booking.create({
        data: {
          dressId: data.dressId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          startDate: new Date(`${data.startDate}T12:00:00.000Z`),
          endDate: new Date(`${data.endDate}T12:00:00.000Z`),
          notes: data.notes,
          type: data.type,
          status: "PENDING",
        },
        include: { dress: { select: { name: true, imageUrl: true } } },
      });

      logger.info("New booking created", {
        bookingId: booking.id,
        dressId: data.dressId,
      });

      res.status(201).json({ booking });
    } catch (error) {
      logger.error("Booking creation failed", { error });
      res.status(500).json({ error: "Failed to create booking" });
    }
  }
);

/**
 * GET /api/bookings
 * Admin-only — list all bookings with filters.
 */
router.get(
  "/",
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, upcoming } = req.query;

      const where: any = {};
      if (status) where.status = String(status);
      if (upcoming === "true") {
        where.endDate = { gte: new Date() };
      }

      const bookings = await prisma.booking.findMany({
        where,
        include: {
          dress: { select: { name: true, imageUrl: true, pricePerDay: true } },
          securityVault: { select: { id: true, depositAmount: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ bookings });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  }
);

/**
 * GET /api/bookings/:id
 * Admin-only — get a single booking.
 */
router.get(
  "/:id",
  requireAuth,
  validate(bookingIdParamSchema, "params"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: String(req.params.id) },
        include: {
          dress: true,
          securityVault: true,
        },
      });

      if (!booking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }

      res.json({ booking });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  }
);

/**
 * PATCH /api/bookings/:id/status
 * Admin-only — update booking status (confirm inspection, mark as rented/returned).
 */
router.patch(
  "/:id/status",
  requireAuth,
  validate(bookingIdParamSchema, "params"),
  validate(updateBookingStatusSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, depositAmount } = req.body;

      const booking = await prisma.booking.findUnique({
        where: { id: String(req.params.id) },
      });

      if (!booking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }

      // Update booking status
      const updated = await prisma.booking.update({
        where: { id: String(req.params.id) },
        data: {
          status,
          ...(depositAmount && { depositAmount }),
        },
        include: { dress: true },
      });

      // If marking as ACTIVE, update dress status
      if (status === "ACTIVE") {
        await prisma.dress.update({
          where: { id: booking.dressId },
          data: { status: "RENTED" },
        });
      }

      // If marking as COMPLETED, free the dress
      if (status === "COMPLETED") {
        await prisma.dress.update({
          where: { id: booking.dressId },
          data: { status: "AVAILABLE" },
        });
      }

      logger.info("Booking status updated", {
        bookingId: req.params.id,
        oldStatus: booking.status,
        newStatus: status,
        adminId: req.adminId,
      });

      res.json({ booking: updated });
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking" });
    }
  }
);

export default router;
