"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/localbase/server";

type Membership = { business_id: string; role: string };

export type Customer = {
  id: string;
  business_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  status: "lead" | "active" | "inactive" | "churned";
  lifetime_value: number | null;
  last_service_at: string | null;
  created_at: string;
  updated_at: string;
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

export async function getCustomers(search?: string) {
  const { lb, business_id } = await getBusiness();
  if (!business_id) return [];

  const { data } = await lb
    .table<Customer>("customers")
    .query()
    .where({ business_id })
    .order("created_at", "desc")
    .run();

  if (!data) return [];

  // Client-side search filter (localbase REST doesn't support OR across columns yet)
  if (!search) return data;
  const q = search.toLowerCase();
  return data.filter((c) =>
    (c.full_name ?? "").toLowerCase().includes(q) ||
    (c.email ?? "").toLowerCase().includes(q) ||
    (c.phone ?? "").toLowerCase().includes(q)
  );
}

const createCustomerSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

export async function createCustomer(formData: FormData) {
  const { lb, business_id } = await getBusiness();
  if (!business_id) return { error: "Not authenticated" };

  const parsed = createCustomerSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await lb.table("customers").insert({
    ...parsed.data,
    business_id,
    email: parsed.data.email || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/customers");
  return { success: true };
}

export async function updateCustomerStatus(
  id: string,
  status: "lead" | "active" | "inactive" | "churned"
) {
  const { lb, business_id } = await getBusiness();
  if (!business_id) return { error: "Not authenticated" };

  const { data: existing } = await lb.table<Customer>("customers").get(id);
  if (!existing || existing.business_id !== business_id) {
    return { error: "Not found" };
  }

  const { error } = await lb.table<Customer>("customers").update(id, { status });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/customers");
  return { success: true };
}
