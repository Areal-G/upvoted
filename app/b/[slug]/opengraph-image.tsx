import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const runtime = "nodejs"; // Prisma requires Node runtime
export const alt = "Upvoted board";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: { slug: string } }) {
  const board = await db.board.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, isPublic: true, _count: { select: { posts: true } } },
  });

  const name = board?.isPublic ? board.name : "Upvoted";
  const description = board?.isPublic
    ? (board.description ?? "Feedback board")
    : "Share ideas, vote, and follow the roadmap";
  const postCount = board?.isPublic ? board._count.posts : 0;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 28, opacity: 0.5, display: "flex" }}>upvoted.app</div>
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          marginTop: 16,
          lineHeight: 1.1,
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: 28,
          marginTop: 24,
          opacity: 0.7,
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {description}
      </div>
      {postCount > 0 && (
        <div
          style={{
            fontSize: 24,
            marginTop: 40,
            opacity: 0.5,
            display: "flex",
          }}
        >
          {postCount} {postCount === 1 ? "post" : "posts"}
        </div>
      )}
    </div>,
    size,
  );
}
