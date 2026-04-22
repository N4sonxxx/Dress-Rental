import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { requireAuth, AuthRequest } from "../middleware/auth";
import {
  createDressSchema,
  updateDressSchema,
  dressIdParamSchema,
} from "../schemas";
import prisma from "../utils/prisma";

const router = Router();

/**
 * GET /api/dresses
 * Public — list dresses with optional filters.
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { size, color, style, status } = req.query;

    const where: any = {};
    if (size) where.size = String(size);
    if (color) where.color = { contains: String(color), mode: "insensitive" };
    if (style) where.style = String(style);
    if (status) where.status = String(status);
    else where.status = "AVAILABLE"; // Default: only show available dresses

    const dresses = await prisma.dress.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ dresses });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dresses" });
  }
});

/**
 * GET /api/dresses/:id
 * Public — get a single dress by ID.
 */
router.get(
  "/:id",
  validate(dressIdParamSchema, "params"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const dress = await prisma.dress.findUnique({
        where: { id: String(req.params.id) },
        include: {
          bookings: {
            where: {
              status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
            },
            select: { startDate: true, endDate: true, status: true },
          },
        },
      });

      if (!dress) {
        res.status(404).json({ error: "Dress not found" });
        return;
      }

      res.json({ dress });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dress" });
    }
  }
);

/**
 * POST /api/dresses
 * Admin-only — create a new dress.
 */
router.post(
  "/",
  requireAuth,
  validate(createDressSchema),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const dress = await prisma.dress.create({ data: _req.body });
      res.status(201).json({ dress });
    } catch (error) {
      res.status(500).json({ error: "Failed to create dress" });
    }
  }
);

/**
 * PATCH /api/dresses/:id
 * Admin-only — update a dress.
 */
router.patch(
  "/:id",
  requireAuth,
  validate(dressIdParamSchema, "params"),
  validate(updateDressSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const dress = await prisma.dress.update({
        where: { id: String(req.params.id) },
        data: req.body,
      });
      res.json({ dress });
    } catch (error) {
      res.status(500).json({ error: "Failed to update dress" });
    }
  }
);

/**
 * DELETE /api/dresses/:id
 * Admin-only — delete a dress.
 */
router.delete(
  "/:id",
  requireAuth,
  validate(dressIdParamSchema, "params"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await prisma.dress.delete({ where: { id: String(req.params.id) } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete dress" });
    }
  }
);

export default router;
