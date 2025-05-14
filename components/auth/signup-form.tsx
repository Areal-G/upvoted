"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { signUp, type AuthFormState } from "@/server/actions/auth";
import { Field, FormError, PasswordField } from "./auth-fields";

export function SignUpForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signUp, {});

  return (
    <form action={action} className="space-y-4" noValidate>
      <FormError message={state.error} />
      <Field
        id="username"
        name="username"
        label="Username"
        placeholder="janedoe"
        autoComplete="username"
        defaultValue={state.values?.["username"]}
        error={state.issues?.["username"]}
        hint="Used for your board link. Letters, numbers and underscores."
        required
      />
      <Field
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@company.com"
        autoComplete="email"
        defaultValue={state.values?.["email"]}
        error={state.issues?.["email"]}
        required
      />
      <PasswordField
        id="password"
        name="password"
        label="Password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        error={state.issues?.["password"]}
        required
      />
      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? "Setting up your board…" : "Get started"}
      </Button>
    </form>
  );
}
