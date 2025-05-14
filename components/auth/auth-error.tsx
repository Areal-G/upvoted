const MESSAGES: Record<string, string> = {
  "google-not-configured":
    "Google sign-in isn't set up on this site yet. Use your email and password instead.",
  OAuthAccountNotLinked: "This email is already registered. Sign in with your password.",
  AccessDenied: "Access was denied. Please try again.",
};

// Errors passed back in the URL (?error=...) by Auth.js or our Google action
export function AuthUrlError({ code }: { code?: string | undefined }) {
  if (!code) return null;
  return (
    <p role="alert" className="bg-destructive/10 text-destructive mb-6 rounded-md px-3 py-2 text-sm">
      {MESSAGES[code] ?? "Something went wrong signing you in. Please try again."}
    </p>
  );
}
