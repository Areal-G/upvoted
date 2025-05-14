import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getBoardByOwner } from "@/server/queries/boards";
import { StatusBadge } from "@/components/posts/status-badge";
import { AdminStatusSelect } from "@/components/posts/admin-status-select";
import { DeletePostButton } from "@/components/posts/delete-post-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Map } from "lucide-react";

export default async function AdminPostsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const board = await getBoardByOwner(session.user.id);
  if (!board) redirect("/login");

  const posts = await db.post.findMany({
    where: { boardId: board.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      _count: { select: { votes: true, comments: true } },
    },
  });

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Posts</h1>
          <p className="text-muted-foreground text-sm">
            Click a status to change it. Planned, In progress and Done ideas appear on your public
            roadmap instantly.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/b/${board.slug}/roadmap`} target="_blank">
            <Map className="mr-1.5 h-4 w-4" /> View roadmap
          </Link>
        </Button>
      </header>

      {posts.length === 0 ? (
        <div className="text-muted-foreground rounded-md border border-dashed p-12 text-center text-sm">
          No posts yet. Share your board link to start collecting feedback.
        </div>
      ) : (
        <div className="relative overflow-x-auto rounded-lg border">
          {/* Scrolls rather than clips on narrow screens; phones also drop the
              comments column and tighten the cell padding. */}
          <table className="w-full text-sm [&_td]:px-3 [&_th]:px-3 sm:[&_td]:px-4 sm:[&_th]:px-4">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Votes</th>
                <th className="hidden px-4 py-3 sm:table-cell">Comments</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((p: (typeof posts)[number]) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">
                    <AdminStatusSelect postId={p.id} current={p.status}>
                      <StatusBadge status={p.status} />
                    </AdminStatusSelect>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{p._count.votes}</td>
                  <td className="hidden px-4 py-3 tabular-nums sm:table-cell">{p._count.comments}</td>
                  <td className="px-4 py-3 text-right">
                    <DeletePostButton postId={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
