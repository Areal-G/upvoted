"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { signInSchema } from "@/lib/validators/auth";

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
