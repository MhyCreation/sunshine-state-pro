"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getBusiness() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, business_id: null, user_id: null };
  const { data } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return { supabase, business_id: data?.business_id ?? null, user_id: user.id };
}

export async function getJobs(opts?: { from?: string; to?: string; status?: string }) {
  const { supabase, business_id } = await getBusiness();
  if (!business_id) return [];

  let query = supabase
    .from("jobs")
    .select(`
      id, title, status, scheduled_start, scheduled_end,
      address, estimated_price, final_price,
      customers(id, full_name, phone)
    `)
    .eq("business_id", business_id)
    .order("scheduled_start", { ascending: true });

  if (opts?.from) query = query.gte("scheduled_start", opts.from);
  if (opts?.to) query = query.lte("scheduled_start", opts.to);
  if (opts?.status) query = query.eq("status", opts.status);

  const { data } = await query;
  return data ?? [];
}

const createJobSchema = z.object({
  title: z.string().min(2),
  customer_id: z.string().uuid().optional().or(z.literal("")),
  service_type: z.string().optional(),
  scheduled_start: z.string(),
  scheduled_end: z.string().optional(),
  address: z.string().optional(),
  estimated_price: z.coerce.number().optional(),
  description: z.string().optional(),
});

export async function createJob(formData: FormData) {
  const { supabase, business_id, user_id } = await getBusiness();
  if (!business_id) return { error: "Not authenticated" };

  const parsed = createJobSchema.safeParse({
    title: formData.get("title"),
    customer_id: formData.get("customer_id") || undefined,
    service_type: formData.get("service_type") || undefined,
    scheduled_start: formData.get("scheduled_start"),
    scheduled_end: formData.get("scheduled_end") || undefined,
    address: formData.get("address") || undefined,
    estimated_price: formData.get("estimated_price") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase.from("jobs").insert({
    ...parsed.data,
    business_id,
    created_by: user_id,
    customer_id: parsed.data.customer_id || null,
    scheduled_end: parsed.data.scheduled_end || null,
    status: "scheduled",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/schedule");
  return { success: true };
}

export async function updateJobStatus(
  id: string,
  status: "quoted" | "scheduled" | "in_progress" | "completed" | "cancelled" | "invoiced"
) {
  const { supabase, business_id } = await getBusiness();
  if (!business_id) return { error: "Not authenticated" };

  const updates: Record<string, unknown> = { status };
  if (status === "in_progress") updates.actual_start = new Date().toISOString();
  if (status === "completed") updates.actual_end = new Date().toISOString();

  const { error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", id)
    .eq("business_id", business_id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/schedule");
  return { success: true };
}
