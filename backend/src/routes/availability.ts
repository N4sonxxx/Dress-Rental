import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { availabilityQuerySchema } from "../schemas";
import prisma from "../utils/prisma";

const router = Router();

/**
 * GET /api/availability
 * Public — check dress availability for a date or month.
 * Read-only, no authentication required.
 */
router.get(
  "/",
  validate(availabilityQuerySchema, "query"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { dressId, date, month } = req.query;

      // If specific dress + date: check if available
      if (dressId && date) {
        const targetDate = new Date(String(date));

        const booking = await prisma.booking.findFirst({
          where: {
            dressId: String(dressId),
            status: { in: ["PENDING_INSPECTION", "INSPECTION_CONFIRMED", "RENTED"] },
            startDate: { lte: targetDate },
            endDate: { gte: targetDate },
          },
        });

        const dress = await prisma.dress.findUnique({
          where: { id: String(dressId) },
          select: { status: true },
        });

        res.json({
          available: !booking && dress?.status === "AVAILABLE",
          dressStatus: dress?.status || "NOT_FOUND",
        });
        return;
      }

      // If specific dress + month: return booked date ranges
      if (dressId && month) {
        const [year, mo] = String(month).split("-").map(Number);
        const start = new Date(year, mo - 1, 1);
        const end = new Date(year, mo, 0, 23, 59, 59);

        const bookings = await prisma.booking.findMany({
          where: {
            dressId: String(dressId),
            status: { in: ["PENDING_INSPECTION", "INSPECTION_CONFIRMED", "RENTED"] },
            OR: [
              { startDate: { lte: end }, endDate: { gte: start } },
            ],
          },
          select: { startDate: true, endDate: true, status: true },
        });

        res.json({ bookedRanges: bookings });
        return;
      }

      // If no specific dress: return all available dresses
      const dresses = await prisma.dress.findMany({
        where: { status: "AVAILABLE" },
        select: { id: true, name: true, size: true, color: true, style: true },
      });

      res.json({ availableDresses: dresses });
    } catch (error) {
      res.status(500).json({ error: "Failed to check availability" });
    }
  }
);

export default router;
