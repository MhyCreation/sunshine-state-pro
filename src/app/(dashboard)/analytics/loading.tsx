export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-navy-100 p-5 h-24">
            <div className="h-3 w-20 bg-navy-100 rounded mb-3" />
            <div className="h-7 w-28 bg-navy-100 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-navy-100 p-6 h-80">
          <div className="h-4 w-40 bg-navy-100 rounded mb-2" />
          <div className="h-3 w-56 bg-navy-50 rounded mb-6" />
          <div className="h-56 bg-navy-50 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-navy-100 p-6 h-80">
          <div className="h-4 w-40 bg-navy-100 rounded mb-2" />
          <div className="h-3 w-56 bg-navy-50 rounded mb-6" />
          <div className="h-56 bg-navy-50 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
