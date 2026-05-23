import { getJobs } from "@/lib/actions/jobs";
import { getCustomers } from "@/lib/actions/customers";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Clock, MapPin, User, LayoutList } from "lucide-react";
import { NewJobButton } from "@/components/dashboard/new-job-modal";
import { WeekCalendar } from "@/components/dashboard/week-calendar";
import Link from "next/link";

const STATUS_STYLES: Record<string, { dot: string; badge: string }> = {
  quoted:      { dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  scheduled:   { dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  completed:   { dot: "bg-navy-300",    badge: "bg-navy-50 text-navy-500 border-navy-200" },
  cancelled:   { dot: "bg-red-400",     badge: "bg-red-50 text-red-600 border-red-200" },
  invoiced:    { dot: "bg-gold-400",    badge: "bg-gold-50 text-gold-700 border-gold-200" },
};

function formatTime(dt?: string | null) {
  if (!dt) return null;
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(dt));
}

function formatDateLabel(dt?: string | null) {
  if (!dt) return "Unscheduled";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric",
  }).format(new Date(dt));
}

function groupByDate(jobs: Awaited<ReturnType<typeof getJobs>>) {
  const groups: Record<string, typeof jobs> = {};
  for (const job of jobs) {
    const key = job.scheduled_start
      ? new Date(job.scheduled_start).toDateString()
      : "unscheduled";
    if (!groups[key]) groups[key] = [];
    groups[key].push(job);
  }
  return groups;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; view?: string }>;
}) {
  const { status, view = "list" } = await searchParams;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(weekStart);
  rangeEnd.setDate(weekStart.getDate() + (view === "calendar" ? 7 : 13));

  const [jobs, customers] = await Promise.all([
    getJobs({
      from: weekStart.toISOString(),
      to: rangeEnd.toISOString(),
      status: status || undefined,
    }),
    getCustomers(),
  ]);

  const grouped = groupByDate(jobs);
  const dates = Object.keys(grouped).sort((a, b) =>
    a === "unscheduled" ? 1 : b === "unscheduled" ? -1 : new Date(a).getTime() - new Date(b).getTime()
  );
  const statuses = ["scheduled", "in_progress", "quoted", "completed", "invoiced"];

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-800">Schedule</h1>
          <p className="text-sm text-navy-500 mt-1">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""}{view === "list" ? " in the next 2 weeks" : " this week"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-navy-200 overflow-hidden text-sm">
            <Link
              href={`/dashboard/schedule?view=list${status ? `&status=${status}` : ""}`}
              className={`px-3 py-1.5 flex items-center gap-1.5 transition ${
                view !== "calendar" ? "bg-navy-800 text-white" : "text-navy-500 hover:bg-navy-50"
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              List
            </Link>
            <Link
              href={`/dashboard/schedule?view=calendar${status ? `&status=${status}` : ""}`}
              className={`px-3 py-1.5 flex items-center gap-1.5 transition ${
                view === "calendar" ? "bg-navy-800 text-white" : "text-navy-500 hover:bg-navy-50"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Calendar
            </Link>
          </div>
          <NewJobButton
            customers={customers.map((c) => ({ id: c.id, full_name: c.full_name }))}
          />
        </div>
      </header>

      {view === "calendar" ? (
        <WeekCalendar jobs={jobs as Parameters<typeof WeekCalendar>[0]["jobs"]} />
      ) : (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            <Link
              href="/dashboard/schedule"
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                !status ? "bg-navy-800 text-white border-navy-800" : "bg-white text-navy-500 border-navy-200 hover:border-navy-400"
              }`}
            >
              All
            </Link>
            {statuses.map((s) => (
              <Link
                key={s}
                href={`/dashboard/schedule?status=${s}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition ${
                  status === s ? "bg-navy-800 text-white border-navy-800" : "bg-white text-navy-500 border-navy-200 hover:border-navy-400"
                }`}
              >
                {s.replace("_", " ")}
              </Link>
            ))}
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-lg border border-navy-100 flex flex-col items-center justify-center py-20 text-center">
              <div className="h-12 w-12 rounded-full bg-navy-50 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-navy-300" />
              </div>
              <p className="text-navy-500 font-medium">No jobs scheduled</p>
              <p className="text-sm text-navy-400 mt-1">Hit "New job" to create your first booking.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {dates.map((dateKey) => {
                const label = dateKey === "unscheduled"
                  ? "Unscheduled"
                  : formatDateLabel(grouped[dateKey][0]?.scheduled_start);
                const isToday = dateKey === new Date().toDateString();

                return (
                  <div key={dateKey}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-sm font-semibold ${isToday ? "text-gold-600" : "text-navy-500"}`}>
                        {isToday ? "Today · " : ""}{label}
                      </span>
                      <div className="flex-1 h-px bg-navy-100" />
                      <span className="text-xs text-navy-400">
                        {grouped[dateKey].length} job{grouped[dateKey].length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {grouped[dateKey].map((job) => {
                        const style = STATUS_STYLES[job.status] ?? STATUS_STYLES.scheduled;
                        const customer = job.customers;
                        return (
                          <div
                            key={job.id}
                            className="bg-white rounded-lg border border-navy-100 p-4 hover:border-navy-200 transition flex items-start gap-4"
                          >
                            <div className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${style.dot}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-navy-800 truncate">{job.title}</p>
                                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${style.badge}`}>
                                  {job.status.replace("_", " ")}
                                </span>
                              </div>
                              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500">
                                {job.scheduled_start && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(job.scheduled_start)}
                                    {job.scheduled_end && ` – ${formatTime(job.scheduled_end)}`}
                                  </span>
                                )}
                                {customer?.full_name && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {customer.full_name}
                                  </span>
                                )}
                                {job.address && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {job.address}
                                  </span>
                                )}
                              </div>
                            </div>
                            {job.estimated_price && (
                              <span className="shrink-0 text-sm font-semibold text-navy-700">
                                {formatCurrency(job.estimated_price)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
