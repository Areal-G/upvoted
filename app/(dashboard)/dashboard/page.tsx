import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBoardByOwner } from "@/server/queries/boards";
import { getBoardStats, type TopPost } from "@/server/queries/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/posts/status-badge";
import { STATUS_LABELS } from "@/lib/constants";
import { ExternalLink, MessageSquare, ThumbsUp, FileText } from "lucide-react";
import type { PostStatusValue } from "@/lib/validators/posts";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const board = await getBoardByOwner(session.user.id);
  if (!board) redirect("/login");

  const stats = await getBoardStats(board.id);

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-muted-foreground text-sm">Activity on your board over all time.</p>
        </div>
        <Link
          href={`/b/${board.slug}`}
          target="_blank"
          className="hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm"
        >
          View public board <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total posts" value={stats.total} icon={<FileText className="h-4 w-4" />} />
        <StatCard
          label="Total votes"
          value={stats.totalVotes}
          icon={<ThumbsUp className="h-4 w-4" />}
        />
        <StatCard
          label="Total comments"
          value={stats.totalComments}
          icon={<MessageSquare className="h-4 w-4" />}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Posts by status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.keys(stats.byStatus) as PostStatusValue[]).map((s) => {
              const count = stats.byStatus[s];
              const pct = stats.total === 0 ? 0 : (count / stats.total) * 100;
              return (
                <div key={s} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{STATUS_LABELS[s]}</span>
                    <span className="tabular-nums">{count}</span>
                  </div>
                  <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top voted posts</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topPosts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No posts yet.</p>
            ) : (
              <ul className="space-y-3">
                {stats.topPosts.map((p: TopPost) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/b/${board.slug}/posts/${p.id}`}
                      className="min-w-0 flex-1 truncate text-sm hover:underline"
                    >
                      {p.title}
                    </Link>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status} />
                      <span className="w-8 text-right text-sm font-medium tabular-nums">
                        {p._count.votes}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>{label}</span>
          {icon}
        </div>
        <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
