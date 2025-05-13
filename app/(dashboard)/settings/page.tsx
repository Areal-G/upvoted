import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBoardByOwner } from "@/server/queries/boards";
import { SettingsForm } from "@/components/board/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const board = await getBoardByOwner(session.user.id);
  if (!board) redirect("/login");

  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Configure how your public board appears to visitors.
        </p>
      </header>

      <SettingsForm
        initial={{
          name: board.name,
          description: board.description ?? "",
          slug: board.slug,
          isPublic: board.isPublic,
        }}
      />
    </div>
  );
}
