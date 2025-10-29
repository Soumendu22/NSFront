import { redirect } from "next/navigation";

export default function LoginPage() {
  // Use server-side redirect to ensure the AuthWrapper handles the routing
  redirect("/auth/login");
} 