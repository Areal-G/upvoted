"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn } from "@/auth";
import { resetDemoWorkspace } from "@/lib/db";
import { DEMO_EMAIL } from "@/lib/demo/data";

// Signs the visitor in as the shared guest account, starting from a fresh sample workspace.
export async function signInAsDemo() {
  await resetDemoWorkspace();
  await signIn("demo", { redirectTo: "/dashboard" });
}

// Called when the page is reloaded: discards whatever the guest changed.
// No-op for everyone except the signed-in guest.
export async function resetDemoOnReload(): Promise<{ reset: boolean }> {
  const session = await auth();
  if (session?.user?.email !== DEMO_EMAIL) return { reset: false };

  await resetDemoWorkspace();
  revalidatePath("/", "layout");
  return { reset: true };
}
