import type { AdminChartPoint } from "@/lib/admin/types";

export function AdminLineChart({ title, data }: { title: string; data: AdminChartPoint[] }) {
  const max = Math.max(1, ...data.map(point => point.value));
  const points = data.map((point, index) => {
    const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * 100;
    const y = 100 - (point.value / max) * 90;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium">{title}</h2>
        <span className="text-xs text-slate-400">{data.length} points</span>
      </div>
      {data.length ? (
        <svg viewBox="0 0 100 100" className="h-52 w-full overflow-visible" role="img" aria-label={title}>
          <polyline fill="none" stroke="rgb(59 130 246)" strokeWidth="2" points={points} />
        </svg>
      ) : (
        <EmptyChart />
      )}
    </div>
  );
}

export function AdminBarChart({ title, data }: { title: string; data: AdminChartPoint[] }) {
  const max = Math.max(1, ...data.map(point => point.value));

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h2 className="mb-4 font-medium">{title}</h2>
      {data.length ? (
        <div className="space-y-3">
          {data.map(point => (
            <div key={point.label}>
              <div className="mb-1 flex justify-between gap-3 text-xs text-slate-400">
                <span className="truncate">{point.label}</span>
                <span>{point.value}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(point.value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyChart />
      )}
    </div>
  );
}

function EmptyChart() {
  return <div className="flex h-52 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-slate-500">No data yet</div>;
}
