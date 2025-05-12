import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PostStatusValue } from "@/lib/validators/posts";

export function StatusBadge({ status }: { status: PostStatusValue }) {
  return (
    <Badge variant="secondary" className={cn("font-medium", STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
