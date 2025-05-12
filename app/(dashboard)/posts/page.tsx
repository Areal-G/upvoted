import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getBoardByOwner } from "@/server/queries/boards";
import { StatusBadge } from "@/components/posts/status-badge";
import { AdminStatusSelect } from "@/components/posts/admin-status-select";
import { DeletePostButton } from "@/components/posts/delete-post-button";

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
          <p className="text-muted-foreground text-sm">Manage all submissions to your board.</p>
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="text-muted-foreground rounded-md border border-dashed p-12 text-center text-sm">
          No posts yet. Share your board link to start collecting feedback.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Votes</th>
                <th className="px-4 py-3">Comments</th>
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
                  <td className="px-4 py-3 tabular-nums">{p._count.comments}</td>
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
