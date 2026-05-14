"use client";

import { useRef, useState, useTransition } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { createCustomer } from "@/lib/actions/customers";

export function NewCustomerButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCustomer(formData);
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
        Add customer
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-navy-800">Add customer</h2>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-md flex items-center justify-center text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
              <Field label="Full name *">
                <input
                  name="full_name"
                  required
                  placeholder="Jane Smith"
                  className={INPUT}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Email">
                  <input name="email" type="email" placeholder="jane@email.com" className={INPUT} />
                </Field>
                <Field label="Phone">
                  <input name="phone" type="tel" placeholder="(305) 555-0100" className={INPUT} />
                </Field>
              </div>

              <Field label="Address">
                <input name="address" placeholder="123 Main St" className={INPUT} />
              </Field>

              <Field label="City">
                <input name="city" placeholder="Miami" className={INPUT} />
              </Field>

              <Field label="Notes">
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Gate code, special instructions, referral source…"
                  className={INPUT}
                />
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
                  Add customer
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
