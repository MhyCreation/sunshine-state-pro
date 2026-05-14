"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { Clock, MapPin, User, DollarSign } from "lucide-react";
import { updateJobStatus } from "@/lib/actions/jobs";
import { formatCurrency } from "@/lib/utils";

type JobStatus = "quoted" | "scheduled" | "in_progress" | "completed" | "invoiced" | "cancelled";

interface Job {
  id: string;
  title: string;
  status: JobStatus;
  scheduled_start: string | null;
  address: string | null;
  estimated_price: number | null;
  final_price: number | null;
  customers: { id: string; full_name: string } | null;
}

const COLUMNS: { key: JobStatus; label: string; color: string; bg: string }[] = [
  { key: "quoted",      label: "Quoted",      color: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
  { key: "scheduled",   label: "Scheduled",   color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
  { key: "in_progress", label: "In Progress", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  { key: "completed",   label: "Completed",   color: "text-navy-600",    bg: "bg-navy-50 border-navy-200" },
  { key: "invoiced",    label: "Invoiced",    color: "text-gold-700",    bg: "bg-gold-50 border-gold-200" },
];

function formatShortDate(dt: string | null) {
  if (!dt) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(dt));
}

function JobCard({ job, isDragging = false }: { job: Job; isDragging?: boolean }) {
  const price = job.final_price ?? job.estimated_price;
  return (
    <div className={`bg-white rounded-lg border border-navy-100 p-3 select-none ${isDragging ? "shadow-xl rotate-1 opacity-90" : "hover:border-navy-200"} transition`}>
      <p className="text-sm font-medium text-navy-800 leading-tight mb-2">{job.title}</p>
      <div className="space-y-1">
        {job.customers && (
          <div className="flex items-center gap-1.5 text-xs text-navy-500">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{job.customers.full_name}</span>
          </div>
        )}
        {job.scheduled_start && (
          <div className="flex items-center gap-1.5 text-xs text-navy-500">
            <Clock className="h-3 w-3 shrink-0" />
            <span>{formatShortDate(job.scheduled_start)}</span>
          </div>
        )}
        {job.address && (
          <div className="flex items-center gap-1.5 text-xs text-navy-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{job.address}</span>
          </div>
        )}
      </div>
      {price && (
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-navy-700">
          <DollarSign className="h-3 w-3" />
          {formatCurrency(price)}
        </div>
      )}
    </div>
  );
}

function DraggableCard({ job }: { job: Job }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: job.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
      <JobCard job={job} isDragging={isDragging} />
    </div>
  );
}

function Column({
  column,
  jobs,
}: {
  column: typeof COLUMNS[number];
  jobs: Job[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });
  const total = jobs.reduce((s, j) => s + (j.final_price ?? j.estimated_price ?? 0), 0);

  return (
    <div className="flex flex-col w-64 shrink-0">
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg border ${column.bg} mb-1`}>
        <span className={`text-xs font-semibold uppercase tracking-wide ${column.color}`}>
          {column.label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-navy-400">{jobs.length}</span>
          {total > 0 && (
            <span className={`text-xs font-medium ${column.color}`}>{formatCurrency(total)}</span>
          )}
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-32 rounded-b-lg p-2 space-y-2 transition ${
          isOver ? "bg-navy-50/80 ring-2 ring-navy-200 ring-inset" : "bg-navy-50/30"
        }`}
      >
        {jobs.map((job) => (
          <DraggableCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

export function JobPipeline({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveJob(jobs.find((j) => j.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveJob(null);
    const { active, over } = event;
    if (!over) return;

    const newStatus = over.id as JobStatus;
    const job = jobs.find((j) => j.id === active.id);
    if (!job || job.status === newStatus) return;

    setJobs((prev) =>
      prev.map((j) => (j.id === active.id ? { ...j, status: newStatus } : j))
    );

    startTransition(() => {
      updateJobStatus(active.id as string, newStatus);
    });
  }

  const grouped = COLUMNS.reduce<Record<string, Job[]>>((acc, col) => {
    acc[col.key] = jobs.filter((j) => j.status === col.key);
    return acc;
  }, {});

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <Column key={col.key} column={col} jobs={grouped[col.key] ?? []} />
        ))}
      </div>
      <DragOverlay>
        {activeJob ? <JobCard job={activeJob} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
