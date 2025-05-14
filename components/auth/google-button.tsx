import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/server/actions/auth";

type Props = { from: "/login" | "/signup"; callbackUrl?: string; label: string };

export function GoogleButton({ from, callbackUrl, label }: Props) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="from" value={from} />
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
      <Button type="submit" variant="outline" className="h-10 w-full">
        <FcGoogle className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </form>
  );
}

export function OrDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background text-muted-foreground px-2">or</span>
      </div>
    </div>
  );
}
