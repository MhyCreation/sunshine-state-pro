import { getInvoices } from "@/lib/actions/invoices";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  draft:     "bg-navy-50 text-navy-500 border-navy-200",
  sent:      "bg-blue-50 text-blue-700 border-blue-200",
  paid:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  overdue:   "bg-red-50 text-red-600 border-red-200",
  cancelled: "bg-navy-50 text-navy-400 border-navy-100",
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  const totals = invoices.reduce(
    (acc, inv) => {
      acc.total += inv.total ?? 0;
      acc.paid += inv.amount_paid ?? 0;
      acc.outstanding += inv.status === "sent" || inv.status === "overdue"
        ? (inv.total ?? 0) - (inv.amount_paid ?? 0)
        : 0;
      return acc;
    },
    { total: 0, paid: 0, outstanding: 0 }
  );

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-800">Invoices</h1>
          <p className="text-sm text-navy-500 mt-1">{invoices.length} total</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800 text-white text-sm font-medium hover:bg-navy-700 transition"
        >
          <Plus className="h-4 w-4" />
          New invoice
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total invoiced", value: formatCurrency(totals.total), color: "text-navy-800" },
          { label: "Collected", value: formatCurrency(totals.paid), color: "text-emerald-600" },
          { label: "Outstanding", value: formatCurrency(totals.outstanding), color: "text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-navy-100 p-4">
            <div className="text-xs text-navy-500">{stat.label}</div>
            <div className={`mt-1 font-display text-2xl font-semibold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-navy-100 overflow-hidden">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 rounded-full bg-navy-50 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-navy-300" />
            </div>
            <p className="text-navy-500 font-medium">No invoices yet</p>
            <p className="text-sm text-navy-400 mt-1">Create your first invoice from a completed job.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wider text-navy-400">
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Due</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {invoices.map((inv) => {
                // @ts-expect-error supabase join typing
                const customer = inv.customers;
                return (
                  <tr key={inv.id} className="hover:bg-navy-50/40 transition">
                    <td className="px-4 py-3 font-mono font-medium text-navy-700">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-navy-600">
                      {customer?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[inv.status] ?? ""}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-navy-800">
                      {formatCurrency(inv.total ?? 0)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-navy-500">
                      {inv.due_date ? formatDate(inv.due_date) : "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-navy-500">
                      {formatDate(inv.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
