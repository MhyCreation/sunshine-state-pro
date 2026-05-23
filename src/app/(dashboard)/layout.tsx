import { redirect } from "next/navigation";
import { createClient } from "@/lib/localbase/server";
import { Sidebar } from "@/components/dashboard/sidebar";

type Membership = { full_name: string; role: string; business_id: string };
type AuthUser = { id: string; email?: string; user_metadata?: Record<string, string> };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const lb = await createClient();
  const { data: user } = await lb.auth.getUser() as { data: AuthUser | null; error: unknown };
  if (!user) redirect("/login");

  const { data: rows } = await lb
    .table<Membership>("business_members")
    .query()
    .where({ user_id: user.id })
    .limit(1)
    .run();

  const membership = rows?.[0] ?? null;

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
