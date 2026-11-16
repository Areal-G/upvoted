import { redirect } from "next/navigation";

// Accounts can't outlive a server instance without a database, so the demo has no
// sign-up: visitors use the guest login instead.
export default function SignUpPage() {
  redirect("/login");
}
