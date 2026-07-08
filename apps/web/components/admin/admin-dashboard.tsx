import type { AdminDashboardData } from "@/lib/admin/types";
import { AdminBarChart, AdminLineChart } from "./admin-charts";

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Users, revenue, extension health, lead generation, AI usage, and system status.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.metrics.map(metric => (
          <div key={metric.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs text-slate-400">{metric.label}</div>
            <div className="mt-2 text-2xl font-semibold">{metric.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AdminLineChart title="Daily Signups" data={data.charts.dailySignups || []} />
        <AdminLineChart title="Revenue" data={data.charts.revenue || []} />
        <AdminLineChart title="Active Users" data={data.charts.activeUsers || []} />
        <AdminLineChart title="Lead Generation" data={data.charts.leadGeneration || []} />
        <AdminBarChart title="Campaign Performance" data={data.charts.campaignPerformance || []} />
        <AdminLineChart title="Extension Installs" data={data.charts.extensionInstalls || []} />
        <AdminLineChart title="Traffic" data={data.charts.traffic || []} />
        <AdminLineChart title="AI Usage" data={data.charts.aiUsage || []} />
        <AdminLineChart title="Customer Revenue Generated" data={data.charts.customerRevenue || []} />
        <AdminLineChart title="Customer Usage Seconds" data={data.charts.customerUsage || []} />
        <AdminBarChart title="Top Communities" data={data.charts.topCommunities || []} />
        <AdminBarChart title="Top Keywords" data={data.charts.topKeywords || []} />
      </section>
    </div>
  );
}
