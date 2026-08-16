import * as z from "zod";

export const updateUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    )
    .optional(),

  profilePhotoUrl: z
    .union([z.httpUrl("Profile photo URL must be a valid URL"), z.null()])
    .optional(),

  profilePhotoId: z
    .union([
      z
        .string()
        .trim()
        .min(1, "Profile photo ID cannot be empty")
        .max(255, "Profile photo ID is too long"),
      z.null(),
    ])
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided",
);

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
