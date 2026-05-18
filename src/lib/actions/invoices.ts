"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/localbase/server";

type Membership = { business_id: string; role: string };

type InvoiceRow = {
  id: string;
  business_id: string;
  customer_id: string;
  job_id: string | null;
  invoice_number: string;
  status: string;
  subtotal: number;
  total: number;
  amount_paid: number | null;
  due_date: string | null;
  sent_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerRow = {
  id: string;
  full_name: string;
  email: string | null;
};

export type Invoice = InvoiceRow & {
  customers: { id: string; full_name: string; email: string | null } | null;
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

export async function getInvoices() {
  const { lb, business_id } = await getBusiness();
  if (!business_id) return [];

  const { data: invoices } = await lb
    .table<InvoiceRow>("invoices")
    .query()
    .where({ business_id })
    .order("created_at", "desc")
    .run();

  if (!invoices?.length) return (invoices ?? []) as Invoice[];

  // Fetch related customers in a single IN query and merge
  const customerIds = [...new Set(invoices.map((inv) => inv.customer_id).filter(Boolean))];

  let customersById: Record<string, CustomerRow> = {};
  if (customerIds.length > 0) {
    const { data: customers } = await lb
      .table<CustomerRow>("customers")
      .query()
      .where({ "id.in": customerIds })
      .limit(1000)
      .run();

    customersById = Object.fromEntries(
      (customers ?? []).map((c) => [c.id, c])
    );
  }

  return invoices.map((inv): Invoice => ({
    ...inv,
    customers: customersById[inv.customer_id]
      ? { id: customersById[inv.customer_id].id, full_name: customersById[inv.customer_id].full_name, email: customersById[inv.customer_id].email }
      : null,
  }));
}

const createInvoiceSchema = z.object({
  customer_id: z.string().uuid(),
  job_id: z.string().uuid().optional().or(z.literal("")),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  line_items: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.coerce.number(),
        unit_price: z.coerce.number(),
      })
    )
    .min(1),
});

export async function createInvoice(data: z.infer<typeof createInvoiceSchema>) {
  const { lb, business_id } = await getBusiness();
  if (!business_id) return { error: "Not authenticated" };

  const parsed = createInvoiceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const subtotal = parsed.data.line_items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  // Count existing invoices to generate the next invoice number
  const { count } = await lb
    .table("invoices")
    .query()
    .where({ business_id })
    .run();

  const invoice_number = `INV-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { data: invoice, error: invError } = await lb.table<InvoiceRow>("invoices").insert({
    business_id,
    customer_id: parsed.data.customer_id,
    job_id: parsed.data.job_id || null,
    invoice_number,
    subtotal,
    total: subtotal,
    due_date: parsed.data.due_date || null,
    notes: parsed.data.notes || null,
  });

  if (invError || !invoice) return { error: invError?.message ?? "Failed to create invoice" };

  const lineItems = parsed.data.line_items.map((item, i) => ({
    invoice_id: invoice!.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    amount: item.quantity * item.unit_price,
    position: i,
  }));

  for (const item of lineItems) {
    const { error: lineError } = await lb.table("invoice_line_items").insert(item);
    if (lineError) return { error: lineError.message };
  }

  revalidatePath("/dashboard/invoices");
  return { success: true, id: invoice!.id };
}

export async function markInvoiceSent(id: string) {
  const { lb, business_id } = await getBusiness();
  if (!business_id) return { error: "Not authenticated" };

  const { data: existing } = await lb.table<InvoiceRow>("invoices").get(id);
  if (!existing || existing.business_id !== business_id) {
    return { error: "Not found" };
  }

  const { error } = await lb
    .table<InvoiceRow>("invoices")
    .update(id, { status: "sent", sent_at: new Date().toISOString() });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/invoices");
  return { success: true };
}

export async function markInvoicePaid(id: string) {
  const { lb, business_id } = await getBusiness();
  if (!business_id) return { error: "Not authenticated" };

  const { data: existing } = await lb.table<InvoiceRow>("invoices").get(id);
  if (!existing || existing.business_id !== business_id) {
    return { error: "Not found" };
  }

  const { error } = await lb.table<InvoiceRow>("invoices").update(id, {
    status: "paid",
    paid_at: new Date().toISOString(),
    amount_paid: existing.total ?? 0,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/invoices");
  return { success: true };
}
