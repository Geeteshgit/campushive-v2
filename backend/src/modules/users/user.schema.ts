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
    .httpUrl("Profile photo URL must be a valid URL")
    .optional(),

  profilePhotoId: z
    .string()
    .trim()
    .min(1, "Profile photo ID cannot be empty")
    .max(255, "Profile photo ID is too long")
    .optional(),
});
