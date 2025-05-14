import { signIn } from "@/auth";

// Test-only bypass page. Security is enforced in the "e2e" Credentials provider's
// authorize(), which returns null unless E2E_TEST_MODE=true.
type Props = { searchParams: Promise<{ email?: string; callbackUrl?: string }> };

export default async function E2ELoginPage({ searchParams }: Props) {
  const { email, callbackUrl } = await searchParams;
  if (!email) return null;

  const doSignIn = async () => {
    "use server";
    await signIn("e2e", { email, redirectTo: callbackUrl ?? "/dashboard" });
  };

  return (
    <form action={doSignIn}>
      <button type="submit" id="e2e-submit">
        Continue as {email}
      </button>
    </form>
  );
}
