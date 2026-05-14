import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the user's membership (RLS-protected; only their rows return)
  const { data: membership } = await supabase
    .from("business_members")
    .select("full_name, role, businesses(name, slug)")
    .eq("user_id", user.id)
    .maybeSingle();

  const name =
    membership?.full_name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "there";

  return (
    <div className="flex min-h-screen bg-navy-50">
      <Sidebar userName={name} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
