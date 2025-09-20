import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import SwipeHistoryClient from "@/components/swipe-history-client";

export default async function SwipeHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <SwipeHistoryClient userId={user.id} />
    </DashboardLayout>
  );
}