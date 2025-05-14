import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ isPublic: false });

  const board = await db.board.findUnique({
    where: { slug },
    select: { isPublic: true },
  });

  return NextResponse.json({ isPublic: board?.isPublic ?? false });
}
