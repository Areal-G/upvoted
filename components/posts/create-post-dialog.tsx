"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createPost } from "@/server/actions/posts";

type Props = { boardSlug: string; authenticated: boolean };

export function CreatePostDialog({ boardSlug, authenticated }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  if (!authenticated) {
    return (
      <Button onClick={() => router.push(`/login?callbackUrl=/b/${boardSlug}`)}>
        <Plus className="mr-2 h-4 w-4" /> Suggest an idea
      </Button>
    );
  }

  function handleSubmit() {
    setErrors({});
    startTransition(async () => {
      const result = await createPost({ boardSlug, title, content });
      if (!result.ok) {
        if (result.issues) setErrors(result.issues);
        toast.error(result.error);
        return;
      }
      toast.success("Post created");
      setTitle("");
      setContent("");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Suggest an idea
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suggest an idea</DialogTitle>
          <DialogDescription>Share what would make this product better.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short, descriptive title"
              maxLength={120}
            />
            {errors["title"] && <p className="text-destructive text-xs">{errors["title"][0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Description</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What problem does it solve?"
              rows={5}
              maxLength={2000}
            />
            {errors["content"] && (
              <p className="text-destructive text-xs">{errors["content"][0]}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Posting…" : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
