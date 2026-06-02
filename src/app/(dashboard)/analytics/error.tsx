"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Analytics error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <h2 className="text-base font-semibold text-navy-800 mb-1">Something went wrong</h2>
      <p className="text-sm text-navy-400 mb-6 max-w-sm">
        {error.message || "An unexpected error occurred loading the analytics page."}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2 bg-navy-800 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
