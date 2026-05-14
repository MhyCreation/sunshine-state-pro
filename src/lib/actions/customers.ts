"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getBusiness() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, business_id: null };
  const { data } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return { supabase, business_id: data?.business_id ?? null };
}

export async function getCustomers(search?: string) {
  const { supabase, business_id } = await getBusiness();
  if (!business_id) return [];

  let query = supabase
    .from("customers")
    .select("id, full_name, email, phone, status, lifetime_value, last_service_at, created_at")
    .eq("business_id", business_id)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data } = await query;
  return data ?? [];
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
  const { supabase, business_id } = await getBusiness();
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

  const { error } = await supabase.from("customers").insert({
    ...parsed.data,
    business_id,
    email: parsed.data.email || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/customers");
  return { success: true };
}

export async function updateCustomerStatus(id: string, status: "lead" | "active" | "inactive" | "churned") {
  const { supabase, business_id } = await getBusiness();
  if (!business_id) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("customers")
    .update({ status })
    .eq("id", id)
    .eq("business_id", business_id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/customers");
  return { success: true };
}
