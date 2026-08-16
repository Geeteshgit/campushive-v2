import * as z from "zod";

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2_000, "Message must be at most 2000 characters")
    .optional(),
  imageUrl: z.httpUrl("Image URL must be a valid URL").optional(),
  imageId: z
    .string()
    .trim()
    .min(1, "Image ID cannot be empty")
    .max(255, "Image ID is too long")
    .optional(),
}).refine(
  (data) => data.content !== undefined || data.imageUrl !== undefined,
  "A message must contain text or an image",
);

export const messagePaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const userIdParamSchema = z.object({
  userId: z.uuid("Invalid user ID"),
});

export const receiverIdParamSchema = z.object({
  receiverId: z.uuid("Invalid receiver ID"),
});

export const conversationIdParamSchema = z.object({
  conversationId: z.uuid("Invalid conversation ID"),
});

export type MessagePagination = z.infer<typeof messagePaginationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
