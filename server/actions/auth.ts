"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { createDefaultBoard } from "@/lib/boards";
import { hashPassword } from "@/lib/password";
import { signInSchema, signUpSchema } from "@/lib/validators/auth";

export type AuthFormState = {
  error?: string;
  issues?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

const safeCallback = (raw: FormDataEntryValue | null) => {
  const url = typeof raw === "string" ? raw : "";
  // Only allow same-site paths to avoid open redirects
  return url.startsWith("/") && !url.startsWith("//") ? url : "/dashboard";
};

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = {
    username: String(formData.get("username") ?? ""),
    email: String(formData.get("email") ?? ""),
  };
  const parsed = signUpSchema.safeParse({ ...values, password: formData.get("password") });
  if (!parsed.success) {
    return { error: "Please fix the fields below.", issues: parsed.error.flatten().fieldErrors, values };
  }
  const { username, email, password } = parsed.data;

  const taken = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, passwordHash: true },
  });
  if (taken) {
    if (taken.email === email) {
      return {
        issues: {
          email: [
            taken.passwordHash
              ? "An account with this email already exists. Sign in instead."
              : "This email is linked to Google. Use Continue with Google.",
          ],
        },
        values,
      };
    }
    return { issues: { username: ["This username is taken"] }, values };
  }

  const user = await db.user.create({
    data: { username, email, name: username, passwordHash: await hashPassword(password) },
  });
  await createDefaultBoard(db, user);

  await signIn("password", { identifier: email, password, redirectTo: "/dashboard" });
  return {};
}

export async function logIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = { identifier: String(formData.get("identifier") ?? "") };
  const parsed = signInSchema.safeParse({ ...values, password: formData.get("password") });
  if (!parsed.success) {
    return { issues: parsed.error.flatten().fieldErrors, values };
  }

  try {
    await signIn("password", { ...parsed.data, redirectTo: safeCallback(formData.get("callbackUrl")) });
  } catch (e) {
    // signIn() throws a redirect on success; only swallow real auth failures
    if (e instanceof AuthError) return { error: "Wrong email, username or password.", values };
    throw e;
  }
  return {};
}

export async function signInWithGoogle(formData: FormData) {
  const from = String(formData.get("from") ?? "/login");
  if (!process.env["AUTH_GOOGLE_ID"] || !process.env["AUTH_GOOGLE_SECRET"]) {
    redirect(`${from === "/signup" ? "/signup" : "/login"}?error=google-not-configured`);
  }
  await signIn("google", { redirectTo: safeCallback(formData.get("callbackUrl")) });
}
