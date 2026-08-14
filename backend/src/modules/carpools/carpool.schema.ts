import * as z from "zod";

export const createCarpoolSchema = z.object({
  pickupPoint: z
    .string()
    .trim()
    .min(3, "Pickup point must be at least 3 characters")
    .max(150, "Pickup point must be at most 150 characters"),

  destinationPoint: z
    .string()
    .trim()
    .min(3, "Destination point must be at least 3 characters")
    .max(150, "Destination point must be at most 150 characters"),

  departureTime: z.coerce
    .date()
    .refine(
      (date) => date > new Date(),
      "Departure time must be in the future",
    ),

  maxMembers: z.coerce
    .number()
    .int("Maximum members must be a whole number")
    .min(1, "At least 1 person is required")
    .max(10, "Maximum 10 people allowed"),
});

export const updateCarpoolSchema = z
  .object({
    pickupPoint: z
      .string()
      .trim()
      .min(3, "Pickup point must be at least 3 characters")
      .max(150, "Pickup point must be at most 150 characters")
      .optional(),

    destinationPoint: z
      .string()
      .trim()
      .min(3, "Destination point must be at least 3 characters")
      .max(150, "Destination point must be at most 150 characters")
      .optional(),

    departureTime: z.coerce
      .date()
      .refine((date) => date > new Date(), "Pickup time must be in the future")
      .optional(),

    maxMembers: z.coerce
      .number()
      .int("Maximum members must be a whole number")
      .min(1, "At least 1 person is required")
      .max(10, "Maximum 10 people allowed")
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export type CreateCarpoolInput = z.infer<typeof createCarpoolSchema>;
export type UpdateCarpoolInput = z.infer<typeof updateCarpoolSchema>;
