import * as z from "zod";

const carpoolLocationSchema = z
  .string()
  .trim()
  .min(3, "Location must be at least 3 characters")
  .max(150, "Location must be at most 150 characters");

const maxMembersSchema = z.coerce
  .number()
  .int("Maximum members must be a whole number")
  .min(1, "At least 1 person is required")
  .max(10, "Maximum 10 people allowed");

export const createCarpoolSchema = z.object({
  pickupPoint: carpoolLocationSchema,
  destinationPoint: carpoolLocationSchema,
  departureTime: z.coerce
    .date()
    .refine((date) => date > new Date(), "Departure time must be in the future"),
  maxMembers: maxMembersSchema,
});

export const updateCarpoolSchema = z
  .object({
    pickupPoint: carpoolLocationSchema.optional(),
    destinationPoint: carpoolLocationSchema.optional(),
    departureTime: z.coerce
      .date()
      .refine((date) => date > new Date(), "Departure time must be in the future")
      .optional(),
    maxMembers: maxMembersSchema.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export const carpoolIdParamSchema = z.object({
  id: z.uuid("Invalid carpool ID"),
});

export const requestIdParamSchema = carpoolIdParamSchema.extend({
  requestId: z.uuid("Invalid request ID"),
});

export const memberIdParamSchema = carpoolIdParamSchema.extend({
  userId: z.uuid("Invalid user ID"),
});

export const carpoolPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z
    .enum(["active", "expired", "cancelled", "all"])
    .default("active"),
});

export const requestDecisionSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

export const requestStatusQuerySchema = z.object({
  status: z
    .enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"])
    .default("PENDING"),
});

export type CreateCarpoolInput = z.infer<typeof createCarpoolSchema>;
export type UpdateCarpoolInput = z.infer<typeof updateCarpoolSchema>;
export type CarpoolPagination = z.infer<typeof carpoolPaginationSchema>;
export type RequestDecision = z.infer<typeof requestDecisionSchema>;
export type RequestStatus = z.infer<typeof requestStatusQuerySchema>["status"];
