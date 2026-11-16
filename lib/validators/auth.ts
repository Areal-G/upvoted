import { z } from "zod";

export const signInSchema = z.object({
  // Email or username
  identifier: z.string().trim().toLowerCase().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});
