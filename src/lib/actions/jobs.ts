"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/localbase/server";

type Membership = { business_id: string; role: string };

type JobRow = {
  id: string;
  business_id: string;
  customer_id: string | null;
  created_by: string | null;
  title: string;
  service_type: string | null;
  status: string;
  scheduled_start: string;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  address: string | null;
  estimated_price: number | null;
  final_price: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerRow = {
  id: string;
  full_name: string;
  phone: string | null;
};

export type Job = JobRow & {
  customers: { id: string; full_name: string; phone: string | null } | null;
};

async function getBusiness() {
  const lb = await createClient();
  const { data: user, error } = await lb.auth.getUser();
  if (error || !user) return { lb, user: null, business_id: null };

  const { data: rows } = await lb
    .table<Membership>("business_members")
    .query()
    .where({ user_id: user.id })
    .limit(1)
    .run();

  const business_id = rows?.[0]?.business_id ?? null;
  return { lb, user, business_id };
}

export async function getJobs(opts?: { from?: string; to?: string; status?: string }) {
  const { lb, business_id } = await getBusiness();
  if (!business_id) return [];

  const filter: Record<string, string | number | boolean | null | string[]> = { business_id };
  if (opts?.from) filter["scheduled_start.gte"] = opts.from;
  if (opts?.to) filter["scheduled_start.lte"] = opts.to;
  if (opts?.status) filter["status"] = opts.status;

  const { data: jobs } = await lb
    .table<JobRow>("jobs")
    .query()
    .where(filter)
    .order("scheduled_start", "asc")
    .run();

  if (!jobs?.length) return (jobs ?? []) as Job[];

  // Fetch related customers in a single IN query and merge
  const customerIds = [...new Set(jobs.map((j) => j.customer_id).filter((id): id is string => !!id))];

  let customersById: Record<string, CustomerRow> = {};
  if (customerIds.length > 0) {
    const { data: customers } = await lb
      .table<CustomerRow>("customers")
      .query()
      .where({ "id.in": customerIds })
      .limit(1000)
      .run();

    customersById = Object.fromEntries((customers ?? []).map((c) => [c.id, c]));
  }

  return jobs.map((job): Job => ({
    ...job,
    customers: job.customer_id && customersById[job.customer_id]
      ? { id: customersById[job.customer_id].id, full_name: customersById[job.customer_id].full_name, phone: customersById[job.customer_id].phone }
      : null,
  }));
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
  const { lb, user, business_id } = await getBusiness();
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

  const { error } = await lb.table("jobs").insert({
    ...parsed.data,
    business_id,
    created_by: user!.id,
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
  const { lb, business_id } = await getBusiness();
  if (!business_id) return { error: "Not authenticated" };

  const { data: existing } = await lb.table<JobRow>("jobs").get(id);
  if (!existing || existing.business_id !== business_id) {
    return { error: "Not found" };
  }

  const updates: Partial<JobRow> & Record<string, unknown> = { status };
  if (status === "in_progress") updates.actual_start = new Date().toISOString();
  if (status === "completed") updates.actual_end = new Date().toISOString();

  const { error } = await lb.table<JobRow>("jobs").update(id, updates);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/schedule");
  return { success: true };
}
