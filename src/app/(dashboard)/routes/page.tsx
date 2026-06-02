import { Route, MapPin, Clock, Fuel } from "lucide-react";

export default function RoutesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-navy-800">Route Optimization</h1>
        <p className="text-sm text-navy-500 mt-1">Smart routing to save your crews time and fuel.</p>
      </header>

      <div className="bg-white rounded-xl border border-navy-100 p-10 text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-navy-800 flex items-center justify-center mb-5">
          <Route className="h-8 w-8 text-gold-400" />
        </div>
        <h2 className="font-display text-xl font-semibold text-navy-800 mb-3">
          Route optimization — coming soon
        </h2>
        <p className="text-sm text-navy-500 max-w-md mx-auto leading-relaxed mb-8">
          Google Maps powered routing will automatically sequence your crews' stops to minimize
          drive time. Save 90+ minutes of windshield time per crew, per day.
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto text-left mb-8">
          {[
            { icon: MapPin, label: "Smart stops", desc: "Auto-sequenced by distance" },
            { icon: Clock, label: "Time savings", desc: "90+ min per crew daily" },
            { icon: Fuel, label: "Fuel savings", desc: "Cut mileage by up to 30%" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-navy-50 p-3">
              <item.icon className="h-4 w-4 text-navy-600 mb-1.5" />
              <div className="text-xs font-medium text-navy-800">{item.label}</div>
              <div className="text-[10px] text-navy-400 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/10 px-3 py-1 text-xs font-medium text-gold-600 border border-gold-400/20">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
          In development — Phase 2
        </span>
      </div>
    </div>
  );
}
