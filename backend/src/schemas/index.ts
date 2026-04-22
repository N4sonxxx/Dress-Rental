import { z } from "zod";

// ── Dress Schemas ──────────────────────────────────────────────

export const createDressSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(2000).trim(),
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
  color: z.string().min(1).max(50).trim(),
  style: z.enum(["COCKTAIL", "EVENING", "CASUAL", "FORMAL", "PROM"]),
  pricePerDay: z.number().positive().max(10000),
  imageUrl: z.string().url().max(500),
});

export const updateDressSchema = createDressSchema.partial().extend({
  status: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE"]).optional(),
});

export const dressIdParamSchema = z.object({
  id: z.string().uuid("Invalid dress ID format"),
});

// ── Booking Schemas ────────────────────────────────────────────

export const createBookingSchema = z
  .object({
    dressId: z.string().uuid("Invalid dress ID"),
    customerName: z.string().min(2).max(200).trim(),
    customerEmail: z.string().email("Invalid email").max(254).trim().toLowerCase(),
    customerPhone: z
      .string()
      .min(8)
      .max(20)
      .regex(/^[+\d\s()-]+$/, "Invalid phone number format"),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
    type: z.enum(["INSPECTION", "RENTAL"]),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: "End date must be on or after start date", path: ["endDate"] }
  );

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "ACTIVE",
    "COMPLETED",
    "CANCELLED",
  ]),
  depositAmount: z.number().positive().max(50000).optional(),
});

export const bookingIdParamSchema = z.object({
  id: z.string().uuid("Invalid booking ID format"),
});

// ── Auth Schemas ───────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email").max(254).trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

// ── Availability Schemas ───────────────────────────────────────

export const availabilityQuerySchema = z.object({
  dressId: z.string().uuid("Invalid dress ID").optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
    .optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Use YYYY-MM format")
    .optional(),
});

// ── Security Vault Schema ──────────────────────────────────────

export const securityVaultSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  depositAmount: z.number().positive().max(50000),
});
