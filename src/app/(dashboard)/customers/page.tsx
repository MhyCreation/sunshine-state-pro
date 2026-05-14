import { getCustomers } from "@/lib/actions/customers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Search } from "lucide-react";
import { NewCustomerButton } from "@/components/dashboard/new-customer-modal";

const STATUS_STYLES = {
  lead:     "bg-amber-50 text-amber-700 border-amber-200",
  active:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-navy-50 text-navy-500 border-navy-200",
  churned:  "bg-red-50 text-red-600 border-red-200",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await getCustomers(q);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-800">Customers</h1>
          <p className="text-sm text-navy-500 mt-1">
            {customers.length} total{q ? ` matching "${q}"` : ""}
          </p>
        </div>
        <NewCustomerButton />
      </header>

      <div className="bg-white rounded-lg border border-navy-100 overflow-hidden">
        <div className="p-4 border-b border-navy-100">
          <form className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, email, phone…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-navy-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-400"
            />
          </form>
        </div>

        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 rounded-full bg-navy-50 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-navy-300" />
            </div>
            <p className="text-navy-500 font-medium">No customers yet</p>
            <p className="text-sm text-navy-400 mt-1">
              Add your first customer to get started.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wider text-navy-400">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Lifetime value</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Last service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-navy-50/40 transition group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-navy-200 to-navy-300 flex items-center justify-center text-navy-700 text-xs font-semibold shrink-0">
                        {c.full_name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-navy-800">{c.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-navy-500">
                    <div>{c.email ?? "—"}</div>
                    <div className="text-xs text-navy-400">{c.phone ?? ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[c.status as keyof typeof STATUS_STYLES] ?? ""}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-navy-700 font-medium">
                    {formatCurrency(c.lifetime_value ?? 0)}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-navy-500">
                    {c.last_service_at ? formatDate(c.last_service_at) : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
