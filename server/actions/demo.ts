"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { db } from "@/lib/db";
import { DEMO_BOARD_PATH, DEMO_EMAIL } from "@/lib/demo/data";
import { resetDemoWorkspace } from "@/lib/demo/reset";

const demoEnabled = () => process.env["DEMO_MODE"] === "true";

// Signs the visitor in as the shared guest account, starting from a fresh sample workspace.
// Without DEMO_MODE, fall back to the read-only public demo board.
export async function signInAsDemo() {
  if (!demoEnabled()) redirect(DEMO_BOARD_PATH);
  await resetDemoWorkspace(db);
  await signIn("demo", { redirectTo: "/dashboard" });
}

// Called when the page is reloaded: discards whatever the guest changed.
// No-op for everyone except the signed-in guest.
export async function resetDemoOnReload(): Promise<{ reset: boolean }> {
  if (!demoEnabled()) return { reset: false };
  const session = await auth();
  if (session?.user?.email !== DEMO_EMAIL) return { reset: false };

  await resetDemoWorkspace(db);
  revalidatePath("/", "layout");
  return { reset: true };
}
