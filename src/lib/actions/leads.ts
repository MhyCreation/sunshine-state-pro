"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const leadSchema = z
  .object({
    name: z.string().max(100).optional(),
    email: z.string().email("Enter a valid email").optional().or(z.literal("")),
    phone: z.string().max(30).optional(),
    industry: z.string().optional(),
  })
  .refine((d) => d.email || d.phone, {
    message: "Please provide an email or phone number",
  });

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// System prompt is ~350 tokens — Opus 4.7 requires ≥4096 for effective prompt caching.
// If lead volume grows, expand this with per-industry few-shot examples to cross the
// threshold and add cache_control back to the system array block.
const OUTREACH_SYSTEM = `You write warm, personal SMS welcome messages for Sunshine State Pro — a platform that helps Florida service businesses automate scheduling, CRM, invoicing, route optimization, and AI follow-ups.

Audience: owners of cleaning, Airbnb turnover, pressure washing, mobile detailing, landscaping, home services, and contracting businesses across Florida.

Tone rules:
- Sound like a real person texting, not a marketing blast
- Reference a genuine operational pain point for their business type
- Never use exclamation marks excessively — one max per message
- Never say "excited to have you" or "welcome aboard" — too generic
- Sign every message with "— The SSP Team"

Pain points by industry:
- cleaning / bi-weekly: juggling recurring schedules, chasing invoices, crew no-shows
- airbnb_turnover: same-day precision, guest handoff timing, last-minute bookings
- pressure_washing: route efficiency, weather cancellations, upselling add-ons
- mobile_detailing: location-based routing, recurring client retention
- landscaping: crew scheduling, rain rescheduling, maintenance contract renewals
- home_services: quoting speed, mixed job types, follow-up drop-off
- contracting: subcontractor coordination, job costing, project overruns

Output only the message text — no labels, no quotes, no commentary.`;

async function generateOutreachMessage(name?: string, industry?: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "";

  const client = new Anthropic({ apiKey });
  const who = name || "there";
  const bizType = industry ? industry.replace(/_/g, " ") : "service business";

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 300,
    system: OUTREACH_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Write a personal SMS welcome message (under 155 characters) for ${who}, who runs a ${bizType} in Florida and just joined the Sunshine State Pro waitlist. Make it feel like a direct note from a real person who understands their day-to-day grind — not a form letter.`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === "text" ? block.text.trim() : "";
}

async function sendSMS(to: string, body: string) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) return;

  const twilio = (await import("twilio")).default;
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  await client.messages.create({ body, from: TWILIO_PHONE_NUMBER, to });
}

async function sendEmail(to: string, name: string | undefined, message: string) {
  const { RESEND_API_KEY } = process.env;
  if (!RESEND_API_KEY) return;

  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);

  const greeting = name ? `Hi ${name},` : "Hi there,";
  await resend.emails.send({
    from: "Sunshine State Pro <hello@sunshinestatepro.com>",
    to,
    subject: "You're on the Sunshine State Pro waitlist",
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;">
        <div style="margin-bottom:24px;">
          <span style="background:#0A1834;color:#F5C547;font-weight:700;font-size:14px;padding:6px 12px;border-radius:6px;">
            Sunshine State Pro
          </span>
        </div>
        <p style="font-size:16px;line-height:1.6;color:#111;">${greeting}</p>
        <p style="font-size:16px;line-height:1.6;color:#111;">${message}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0;" />
        <p style="font-size:12px;color:#888;">Sunshine State Pro · Built in Florida · <a href="https://sunshinestatepro.com" style="color:#D4A017;">sunshinestatepro.com</a></p>
      </div>
    `,
  });
}

export async function captureLeadAction(_prev: unknown, formData: FormData) {
  const raw = {
    name: (formData.get("name") as string | null) || undefined,
    email: (formData.get("email") as string | null) || undefined,
    phone: (formData.get("phone") as string | null) || undefined,
    industry: (formData.get("industry") as string | null) || undefined,
  };

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, phone, industry } = parsed.data;
  const db = supabaseAdmin();

  const { data: lead, error: dbError } = await db
    .from("leads")
    .insert({ name, email: email || null, phone: phone || null, industry })
    .select("id")
    .single();

  if (dbError) {
    return { error: "Something went wrong. Please try again." };
  }

  let outreachStatus = "pending";
  try {
    const message = await generateOutreachMessage(name, industry);
    if (message) {
      const sends: Promise<void>[] = [];
      if (phone) sends.push(sendSMS(phone, message));
      if (email) sends.push(sendEmail(email, name, message));
      await Promise.all(sends);
      outreachStatus = "sent";
    }
  } catch {
    outreachStatus = "failed";
  }

  await db
    .from("leads")
    .update({
      outreach_status: outreachStatus,
      outreach_sent_at: outreachStatus === "sent" ? new Date().toISOString() : null,
    })
    .eq("id", lead.id);

  return { success: true };
}
