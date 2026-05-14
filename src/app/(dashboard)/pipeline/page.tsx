import { getJobs } from "@/lib/actions/jobs";
import { JobPipeline } from "@/components/dashboard/job-pipeline";
import { KanbanSquare } from "lucide-react";

export default async function PipelinePage() {
  const jobs = await getJobs();

  return (
    <div className="max-w-[1400px] mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-800">Pipeline</h1>
          <p className="text-sm text-navy-500 mt-1">
            Drag jobs between columns to update their status
          </p>
        </div>
      </header>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg border border-navy-100 flex flex-col items-center justify-center py-24 text-center">
          <div className="h-12 w-12 rounded-full bg-navy-50 flex items-center justify-center mb-4">
            <KanbanSquare className="h-6 w-6 text-navy-300" />
          </div>
          <p className="text-navy-500 font-medium">No jobs yet</p>
          <p className="text-sm text-navy-400 mt-1">
            Create a job from the Schedule page to see it here.
          </p>
        </div>
      ) : (
        <JobPipeline initialJobs={jobs as Parameters<typeof JobPipeline>[0]["initialJobs"]} />
      )}
    </div>
  );
}
