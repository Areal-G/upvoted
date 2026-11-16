import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthUrlError } from "@/components/auth/auth-error";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ callbackUrl?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl, error } = await searchParams;

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
    </AuthShell>
  );
}
