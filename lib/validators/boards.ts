import { z } from "zod";

export const updateBoardSchema = z.object({
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(280).optional().nullable(),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  isPublic: z.boolean(),
});

export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
