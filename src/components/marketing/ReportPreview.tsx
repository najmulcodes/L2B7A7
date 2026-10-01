const BREAKDOWN = [
  { title: "Reverse a linked list", type: "CODING", score: 18, max: 20 },
  { title: "SQL joins", type: "MCQ", score: 10, max: 10 },
  { title: "Design a rate limiter", type: "WRITTEN", score: 22, max: 25 },
];

export function ReportPreview() {
  const total = BREAKDOWN.reduce((sum, b) => sum + b.score, 0);
  const max = BREAKDOWN.reduce((sum, b) => sum + b.max, 0);
  const percent = Math.round((total / max) * 100);

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12151C] font-mono text-[13px] shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="text-white/50">attempt_report.json</span>
        <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-400">PASSED</span>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div>
          <p className="text-white/40">Backend Engineer — Round 1</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-white">{percent}%</span>
            <span className="text-white/40">
              {total} / {max} pts
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="space-y-2.5 border-t border-white/10 pt-4">
          {BREAKDOWN.map((item) => (
            <div key={item.title} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-white/80">{item.title}</p>
                <p className="text-[11px] text-white/35">{item.type}</p>
              </div>
              <span className="shrink-0 text-white/60">
                {item.score}/{item.max}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
