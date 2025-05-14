"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { logIn, type AuthFormState } from "@/server/actions/auth";
import { Field, FormError, PasswordField } from "./auth-fields";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(logIn, {});

  return (
    <form action={action} className="space-y-4" noValidate>
      <FormError message={state.error} />
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
      <Field
        id="identifier"
        name="identifier"
        label="Email or username"
        placeholder="you@company.com"
        autoComplete="username"
        defaultValue={state.values?.["identifier"]}
        error={state.issues?.["identifier"]}
        required
      />
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        error={state.issues?.["password"]}
        required
      />
      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
