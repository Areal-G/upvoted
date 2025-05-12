import { z } from "zod";

export const PostStatusSchema = z.enum(["OPEN", "PLANNED", "IN_PROGRESS", "DONE", "REJECTED"]);

export type PostStatusValue = z.infer<typeof PostStatusSchema>;

export const createPostSchema = z.object({
  boardSlug: z.string().min(1),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  content: z.string().trim().min(10, "Content must be at least 10 characters").max(2000),
  categoryId: z.string().cuid().optional().nullable(),
});

export const updatePostSchema = z.object({
  postId: z.string().cuid(),
  title: z.string().trim().min(3).max(120).optional(),
  content: z.string().trim().min(10).max(2000).optional(),
  categoryId: z.string().cuid().optional().nullable(),
});

export const changeStatusSchema = z.object({
  postId: z.string().cuid(),
  status: PostStatusSchema,
});

export const deletePostSchema = z.object({
  postId: z.string().cuid(),
});

export const listPostsQuerySchema = z.object({
  slug: z.string().min(1),
  status: PostStatusSchema.optional(),
  sort: z.enum(["new", "top"]).default("new"),
  page: z.coerce.number().int().min(1).default(1),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
