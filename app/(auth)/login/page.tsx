import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthUrlError } from "@/components/auth/auth-error";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";
import { TryDemoButton } from "@/components/demo/try-demo-button";

export const metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ callbackUrl?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl, error } = await searchParams;
  const demoEnabled = process.env["DEMO_MODE"] === "true";

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your board and roadmap."
      footer={
        <>
          New to Upvoted?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Get started
          </Link>
        </>
      }
    >
      <AuthUrlError code={error} />
      <GoogleButton from="/login" callbackUrl={callbackUrl} label="Continue with Google" />
      <OrDivider />
      <LoginForm callbackUrl={callbackUrl} />

      {demoEnabled && (
        <div className="bg-primary/5 border-primary/20 mt-6 rounded-lg border p-3">
          <p className="text-sm font-medium">Just looking around?</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Explore a demo workspace full of sample feedback. No account needed.
          </p>
          <TryDemoButton
            variant="secondary"
            size="sm"
            className="mt-3 w-full"
            label="Continue as guest"
          />
        </div>
      )}
    </AuthShell>
  );
}
