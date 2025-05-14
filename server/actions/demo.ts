"use server";

import { signIn } from "@/auth";

export async function signInAsDemo() {
  if (process.env["DEMO_MODE"] !== "true") {
    return { ok: false as const, error: "Demo mode disabled" };
  }
  await signIn("demo", { redirectTo: "/dashboard" });
}
