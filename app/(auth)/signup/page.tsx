import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthUrlError } from "@/components/auth/auth-error";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata = { title: "Get started" };

type Props = { searchParams: Promise<{ error?: string }> };

export default async function SignUpPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Get started"
      subtitle="Start collecting feedback in under a minute. Free, no card needed."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AuthUrlError code={error} />
      <GoogleButton from="/signup" label="Sign up with Google" />
      <OrDivider />
      <SignUpForm />
    </AuthShell>
  );
}
