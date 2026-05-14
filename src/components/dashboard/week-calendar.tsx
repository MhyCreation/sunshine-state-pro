"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type JobStatus = "quoted" | "scheduled" | "in_progress" | "completed" | "cancelled" | "invoiced";

interface Job {
  id: string;
  title: string;
  status: JobStatus;
  scheduled_start: string | null;
  scheduled_end: string | null;
  address: string | null;
  estimated_price: number | null;
  customers: { id: string; full_name: string } | null;
}

const STATUS_BG: Record<string, string> = {
  quoted:      "bg-amber-100 border-amber-300 text-amber-800",
  scheduled:   "bg-blue-100 border-blue-300 text-blue-800",
  in_progress: "bg-emerald-100 border-emerald-300 text-emerald-800",
  completed:   "bg-navy-100 border-navy-300 text-navy-600",
  invoiced:    "bg-yellow-100 border-yellow-300 text-yellow-800",
  cancelled:   "bg-red-100 border-red-300 text-red-700",
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am–7pm

function startOfWeek(d: Date) {
  const day = new Date(d);
  day.setDate(d.getDate() - d.getDay());
  day.setHours(0, 0, 0, 0);
  return day;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatHour(h: number) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric" }).format(new Date(2000, 0, 1, h));
}

function topPercent(dt: Date) {
  const h = dt.getHours() + dt.getMinutes() / 60;
  return ((h - 7) / 12) * 100;
}

function heightPercent(start: Date, end: Date) {
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return (Math.min(diff, 12) / 12) * 100;
}

export function WeekCalendar({ jobs }: { jobs: Job[] }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const jobsByDay = days.map((day) =>
    jobs.filter((j) => j.scheduled_start && sameDay(new Date(j.scheduled_start), day))
  );

  return (
    <div className="bg-white rounded-lg border border-navy-100 overflow-hidden">
      {/* Week nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100">
        <button
          onClick={() => setWeekStart((w) => addDays(w, -7))}
          className="h-8 w-8 rounded-md flex items-center justify-center text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-navy-700">
          {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(weekStart)}
        </span>
        <button
          onClick={() => setWeekStart((w) => addDays(w, 7))}
          className="h-8 w-8 rounded-md flex items-center justify-center text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-navy-100">
        <div />
        {days.map((day, i) => {
          const isToday = sameDay(day, today);
          return (
            <div key={i} className={`py-2 text-center border-l border-navy-50 ${isToday ? "bg-gold-50" : ""}`}>
              <div className="text-[10px] uppercase tracking-wider text-navy-400">
                {new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day)}
              </div>
              <div className={`text-sm font-semibold mt-0.5 ${isToday ? "text-gold-600" : "text-navy-700"}`}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto max-h-[520px]">
        <div className="grid grid-cols-[48px_repeat(7,1fr)]">
          {/* Hour labels */}
          <div className="relative">
            {HOURS.map((h) => (
              <div key={h} className="h-16 flex items-start justify-end pr-2 pt-1">
                <span className="text-[10px] text-navy-400">{formatHour(h)}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, di) => (
            <div key={di} className="relative border-l border-navy-50">
              {HOURS.map((h) => (
                <div key={h} className="h-16 border-b border-navy-50/60" />
              ))}

              {/* Jobs */}
              {jobsByDay[di].map((job) => {
                const start = new Date(job.scheduled_start!);
                const end = job.scheduled_end
                  ? new Date(job.scheduled_end)
                  : new Date(start.getTime() + 60 * 60 * 1000);

                const top = topPercent(start);
                const height = heightPercent(start, end);
                if (top < 0 || top > 100) return null;

                return (
                  <div
                    key={job.id}
                    className={`absolute left-0.5 right-0.5 rounded border text-[10px] px-1 py-0.5 overflow-hidden cursor-default ${STATUS_BG[job.status] ?? STATUS_BG.scheduled}`}
                    style={{
                      top: `${(top / 100) * (HOURS.length * 64)}px`,
                      height: `${Math.max((height / 100) * (HOURS.length * 64), 20)}px`,
                    }}
                  >
                    <div className="font-semibold truncate leading-tight">{job.title}</div>
                    {job.customers && (
                      <div className="flex items-center gap-0.5 truncate opacity-75">
                        <User className="h-2.5 w-2.5 shrink-0" />
                        {job.customers.full_name}
                      </div>
                    )}
                    {job.estimated_price && (
                      <div className="flex items-center gap-0.5 opacity-75">
                        <Clock className="h-2.5 w-2.5 shrink-0" />
                        {formatCurrency(job.estimated_price)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
