import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  // Redirect any protected page access to the dashboard
  redirect("/dashboard");
}
