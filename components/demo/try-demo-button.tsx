import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInAsDemo } from "@/server/actions/demo";

type Props = React.ComponentProps<typeof Button> & { label?: string };

export function TryDemoButton({ label = "Try demo", className, ...props }: Props) {
  return (
    <form action={signInAsDemo} className="contents">
      <Button type="submit" className={className} {...props}>
        <Sparkles className="mr-1.5 h-4 w-4" />
        {label}
      </Button>
    </form>
  );
}
