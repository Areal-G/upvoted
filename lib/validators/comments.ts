import { z } from "zod";

export const createCommentSchema = z.object({
  postId: z.cuid2(),
  content: z.string().trim().min(1, "Comment cannot be empty").max(1000),
});

export const deleteCommentSchema = z.object({
  commentId: z.cuid2(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
