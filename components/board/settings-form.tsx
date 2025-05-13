"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { updateBoard } from "@/server/actions/boards";

type Props = {
  initial: { name: string; description: string; slug: string; isPublic: boolean };
};

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const dirty =
    form.name !== initial.name ||
    form.description !== initial.description ||
    form.slug !== initial.slug ||
    form.isPublic !== initial.isPublic;

  function handleSubmit() {
    setErrors({});
    startTransition(async () => {
      const result = await updateBoard({
        name: form.name,
        description: form.description || null,
        slug: form.slug,
        isPublic: form.isPublic,
      });
      if (!result.ok) {
        if (result.issues) setErrors(result.issues);
        toast.error(result.error);
        return;
      }
      toast.success("Settings saved");
      if (result.data.slug !== initial.slug) {
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="name">Board name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            maxLength={60}
          />
          {errors["name"] && <p className="text-destructive text-xs">{errors["name"][0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            maxLength={280}
            placeholder="Optional. Shown at the top of your public board."
          />
          {errors["description"] && (
            <p className="text-destructive text-xs">{errors["description"][0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL slug</Label>
          <div className="focus-within:ring-ring flex items-center rounded-md border focus-within:ring-2">
            <span className="text-muted-foreground px-3 text-sm">/b/</span>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
              maxLength={40}
              className="border-0 focus-visible:ring-0"
            />
          </div>
          {errors["slug"] && <p className="text-destructive text-xs">{errors["slug"][0]}</p>}
          <p className="text-muted-foreground text-xs">
            Lowercase letters, numbers and hyphens only. Changing the slug will break existing
            links.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-md border p-4">
          <div>
            <Label htmlFor="isPublic" className="text-sm">
              Public board
            </Label>
            <p className="text-muted-foreground mt-1 text-xs">
              When off, the board returns a 404 to anyone but you.
            </p>
          </div>
          <Switch
            id="isPublic"
            checked={form.isPublic}
            onCheckedChange={(v) => setForm({ ...form, isPublic: v })}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setForm(initial)} disabled={!dirty || isPending}>
            Reset
          </Button>
          <Button onClick={handleSubmit} disabled={!dirty || isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
