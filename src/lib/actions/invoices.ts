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

export async function getInvoices() {
  const { supabase, business_id } = await getBusiness();
  if (!business_id) return [];

  const { data } = await supabase
    .from("invoices")
    .select(`
      id, invoice_number, status, total, amount_paid, due_date,
      sent_at, paid_at, created_at,
      customers(id, full_name, email)
    `)
    .eq("business_id", business_id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

const createInvoiceSchema = z.object({
  customer_id: z.string().uuid(),
  job_id: z.string().uuid().optional().or(z.literal("")),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  line_items: z.array(z.object({
    description: z.string(),
    quantity: z.coerce.number(),
    unit_price: z.coerce.number(),
  })).min(1),
});

export async function createInvoice(data: z.infer<typeof createInvoiceSchema>) {
  const { supabase, business_id } = await getBusiness();
  if (!business_id) return { error: "Not authenticated" };

  const parsed = createInvoiceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const subtotal = parsed.data.line_items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business_id);

  const invoice_number = `INV-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert({
      business_id,
      customer_id: parsed.data.customer_id,
      job_id: parsed.data.job_id || null,
      invoice_number,
      subtotal,
      total: subtotal,
      due_date: parsed.data.due_date || null,
      notes: parsed.data.notes || null,
    })
    .select()
    .single();

  if (invError || !invoice) return { error: invError?.message ?? "Failed to create invoice" };

  const lineItems = parsed.data.line_items.map((item, i) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    amount: item.quantity * item.unit_price,
    position: i,
  }));

  const { error: lineError } = await supabase.from("invoice_line_items").insert(lineItems);
  if (lineError) return { error: lineError.message };

  revalidatePath("/dashboard/invoices");
  return { success: true, id: invoice.id };
}

export async function markInvoiceSent(id: string) {
  const { supabase, business_id } = await getBusiness();
  if (!business_id) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("invoices")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id)
    .eq("business_id", business_id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/invoices");
  return { success: true };
}

export async function markInvoicePaid(id: string) {
  const { supabase, business_id } = await getBusiness();
  if (!business_id) return { error: "Not authenticated" };

  const { data: inv } = await supabase
    .from("invoices")
    .select("total")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString(), amount_paid: inv?.total ?? 0 })
    .eq("id", id)
    .eq("business_id", business_id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/invoices");
  return { success: true };
}
