import { z } from "zod";

export const toggleVoteSchema = z.object({
  postId: z.cuid2(),
});

export type ToggleVoteInput = z.infer<typeof toggleVoteSchema>;
