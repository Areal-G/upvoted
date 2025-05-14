import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

  const boards = await db.board.findMany({
    where: { isPublic: true },
    select: { slug: true },
  });

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly" },
    ...boards.flatMap((b) => [
      {
        url: `${base}/b/${b.slug}`,
        changeFrequency: "daily" as const,
      },
      {
        url: `${base}/b/${b.slug}/roadmap`,
        changeFrequency: "weekly" as const,
      },
    ]),
  ];
}
