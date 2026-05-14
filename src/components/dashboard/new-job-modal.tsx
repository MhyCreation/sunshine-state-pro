"use client";

import { useRef, useState, useTransition } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { createJob } from "@/lib/actions/jobs";

interface Customer { id: string; full_name: string }

export function NewJobButton({ customers, defaultDate }: { customers: Customer[]; defaultDate?: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createJob(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        formRef.current?.reset();
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800 text-white text-sm font-medium hover:bg-navy-700 transition"
      >
        <Plus className="h-4 w-4" />
        New job
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-navy-800">New job</h2>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-md flex items-center justify-center text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
              <Field label="Job title *">
                <input
                  name="title"
                  required
                  placeholder="e.g. Pressure wash — 412 Ocean Dr"
                  className={INPUT}
                />
              </Field>

              <Field label="Customer">
                <select name="customer_id" className={INPUT}>
                  <option value="">No customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Start *">
                  <input
                    name="scheduled_start"
                    type="datetime-local"
                    required
                    defaultValue={defaultDate}
                    className={INPUT}
                  />
                </Field>
                <Field label="End">
                  <input name="scheduled_end" type="datetime-local" className={INPUT} />
                </Field>
              </div>

              <Field label="Address">
                <input name="address" placeholder="123 Main St, Miami, FL" className={INPUT} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Service type">
                  <select name="service_type" className={INPUT}>
                    <option value="">Select…</option>
                    {["Cleaning","Pressure wash","Airbnb turnover","Mobile detail","Landscaping","Other"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Estimated price">
                  <input
                    name="estimated_price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="250.00"
                    className={INPUT}
                  />
                </Field>
              </div>

              <Field label="Notes">
                <textarea name="description" rows={2} placeholder="Any special instructions…" className={INPUT} />
              </Field>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-navy-200 text-sm font-medium text-navy-600 hover:bg-navy-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-navy-800 text-white text-sm font-medium hover:bg-navy-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-navy-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

const INPUT = "w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white text-navy-800 placeholder:text-navy-300";
