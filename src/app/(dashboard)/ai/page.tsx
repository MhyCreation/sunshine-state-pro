import { Sparkles, MessageSquare, FileText, TrendingUp } from "lucide-react";

export default function AIPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-navy-800">AI Assistant</h1>
        <p className="text-sm text-navy-500 mt-1">Your always-on business co-pilot.</p>
      </header>

      <div className="bg-white rounded-xl border border-navy-100 p-10 text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-navy-800 flex items-center justify-center mb-5">
          <Sparkles className="h-8 w-8 text-gold-400" />
        </div>
        <h2 className="font-display text-xl font-semibold text-navy-800 mb-3">
          AI assistant — coming soon
        </h2>
        <p className="text-sm text-navy-500 max-w-md mx-auto leading-relaxed mb-8">
          Your AI co-pilot will generate quotes, draft customer follow-ups, suggest upsells,
          run winback campaigns, and surface business insights — all in plain English.
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-left mb-8">
          {[
            { icon: FileText, label: "Quote generation", desc: "Instant branded estimates from job details" },
            { icon: MessageSquare, label: "Follow-up drafts", desc: "Personalised SMS & email copy" },
            { icon: TrendingUp, label: "Business insights", desc: "Revenue trends, churn risk, upsell signals" },
            { icon: Sparkles, label: "Winback campaigns", desc: "Re-engage lapsed customers automatically" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-navy-50 p-4">
              <item.icon className="h-4 w-4 text-navy-600 mb-2" />
              <div className="text-xs font-medium text-navy-800">{item.label}</div>
              <div className="text-[10px] text-navy-400 mt-0.5 leading-relaxed">{item.desc}</div>
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
