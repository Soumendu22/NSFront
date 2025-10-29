import { redirect } from "next/navigation";

export default function SignupPage() {
  // Use server-side redirect to ensure the AuthWrapper handles the routing
  redirect("/auth/signup");
} 