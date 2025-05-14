import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resetDemoWorkspace } from "@/lib/demo/reset";

// Nightly safety net (vercel.json cron) on top of the reset on "Try demo" / reload
export async function GET(req: Request) {
  const cronSecret = process.env["CRON_SECRET"];
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env["DEMO_MODE"] !== "true") {
    return NextResponse.json({ error: "Not in demo mode" }, { status: 400 });
  }

  const result = await resetDemoWorkspace(db);
  return NextResponse.json({ ok: true, ...result, reset: new Date().toISOString() });
}
