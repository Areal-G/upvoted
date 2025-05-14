import { z } from "zod";

export const signUpSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "At least 3 characters")
    .max(20, "At most 20 characters")
    .regex(/^[a-z0-9_]+$/, "Letters, numbers and underscores only"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").max(100),
});

export const signInSchema = z.object({
  // Email or username
  identifier: z.string().trim().toLowerCase().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
