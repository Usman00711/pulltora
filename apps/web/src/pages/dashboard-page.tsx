import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardIntelligence } from '@devpulse/shared';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard } from '@/components/intelligence/chart-card';
import { EmptyState } from '@/components/intelligence/empty-state';
import { HealthScoreCard } from '@/components/intelligence/health-score-card';
import { MetricCard } from '@/components/intelligence/metric-card';
import { SkeletonPanel } from '@/components/intelligence/skeleton-panel';
import { getHealthTone, StatusBadge } from '@/components/intelligence/status-badge';
import { repositoryService } from '@/services/repository-service';

const chartColors = ['#22d3ee', '#8b5cf6', '#34d399', '#f59e0b', '#fb7185', '#a78bfa'];
const DASHBOARD_CACHE_KEY = 'pulltora_dashboard_intelligence_cache';

function hasChartData(data: Array<{ value: number }>) {
  return data.some((point) => point.value > 0);
}

function ChartEmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function readDashboardCache(): DashboardIntelligence | undefined {
  try {
    const cached = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
    return cached ? (JSON.parse(cached) as DashboardIntelligence) : undefined;
  } catch {
    return undefined;
  }
}

export default function DashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboardIntelligence'],
    queryFn: () => repositoryService.getDashboardIntelligence(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    initialData: readDashboardCache
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    try {
      sessionStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage failures; dashboard still works with network data.
    }
  }, [data]);

  if (isLoading) {
    return <SkeletonPanel variant="dashboard" />;
  }

  if (isError) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-black">Delivery Dashboard</h1>
        <p className="text-sm text-red-300">{error instanceof Error ? error.message : 'Failed to load dashboard intelligence.'}</p>
        <button className="btn-soft" onClick={() => void refetch()}>
          Retry
        </button>
      </section>
    );
  }

  if (!data || data.totals.repositories === 0) {
    return (
      <section className="space-y-6">
        <div className="page-title">
          <div>
            <p className="kpi-badge">Delivery Overview</p>
            <h1 className="mt-2 text-3xl font-black">Delivery Dashboard</h1>
          </div>
        </div>
        <EmptyState
          title="No repositories connected yet"
          description="Add a repository, sync GitHub data, and run analysis to light up the intelligence dashboard."
        />
      </section>
    );
  }

  const averageLevel =
    data.totals.averageHealth >= 85
      ? 'EXCELLENT'
      : data.totals.averageHealth >= 70
        ? 'STABLE'
        : data.totals.averageHealth >= 50
          ? 'WATCH'
          : 'AT_RISK';

  return (
    <section className="space-y-6">
      <div className="page-title motion-rise">
        <div>
          <p className="kpi-badge">Delivery Overview</p>
          <h1 className="mt-2 text-3xl font-black">Delivery Dashboard</h1>
          <p className="text-sm text-muted-foreground">Engineering intelligence across every connected repository.</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span className="kpi-badge status-ok">Live Intelligence</span>
          <span className="text-xs text-muted-foreground">Updated from latest analyzed snapshots</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <div className="xl:col-span-1">
          <HealthScoreCard score={data.totals.averageHealth} level={averageLevel} reasons={data.topRisks} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-3 xl:grid-cols-4">
          <MetricCard label="High-risk PRs" value={data.totals.highRiskPrs} tone="amber" />
          <MetricCard label="Critical Issues" value={data.totals.criticalIssues} tone="rose" />
          <MetricCard label="Review Bottlenecks" value={data.totals.reviewBottlenecks} tone="violet" />
          <MetricCard label="Hotspots" value={data.totals.hotspotFiles} tone="cyan" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="PR Risk Distribution">
          {hasChartData(data.prRiskDistribution) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.prRiskDistribution}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#080b12', border: '1px solid #253044', color: '#e5faff' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {data.prRiskDistribution.map((_, index) => (
                    <Cell key={index} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState label="No pull request risk data yet" />
          )}
        </ChartCard>

        <ChartCard title="Issues by Status">
          {hasChartData(data.issueDistribution) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.issueDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4}>
                  {data.issueDistribution.map((_, index) => (
                    <Cell key={index} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#080b12', border: '1px solid #253044', color: '#e5faff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState label="No issue signals yet" />
          )}
        </ChartCard>

        <ChartCard title="Contributor Workload">
          {hasChartData(data.workloadDistribution) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.workloadDistribution}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#080b12', border: '1px solid #253044', color: '#e5faff' }} />
                <Bar dataKey="value" fill="#34d399" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState label="No workload signals yet" />
          )}
        </ChartCard>

        <ChartCard title="Hotspot Modules">
          {hasChartData(data.hotspotModules) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hotspotModules}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#080b12', border: '1px solid #253044', color: '#e5faff' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState label="No hotspot modules yet" />
          )}
        </ChartCard>
      </div>

      <article className="panel p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">Repository Health</h2>
        <div className="data-table-card mt-4">
        <table className="data-table min-w-[900px]">
          <thead>
            <tr>
              <th className="cell-title">Repository</th>
              <th className="cell-status w-48">Health</th>
              <th className="cell-right w-32">High-risk PRs</th>
              <th className="cell-right w-36">Critical issues</th>
              <th className="cell-right w-28">Reviews</th>
              <th className="cell-right w-28">Hotspots</th>
            </tr>
          </thead>
          <tbody>
            {data.repositories.map((repository) => (
              <tr key={repository.repositoryId} className="data-table-row">
                <td className="cell-title">
                  <Link className="cell-truncate font-semibold text-cyan-200 hover:text-cyan-100" title={repository.fullName} to={`/repositories/${repository.repositoryId}`}>
                    {repository.fullName}
                  </Link>
                </td>
                <td className="cell-status">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{repository.score}</span>
                    <StatusBadge label={repository.level.replace('_', ' ')} tone={getHealthTone(repository.level)} />
                  </div>
                </td>
                <td className="cell-right cell-mono">{repository.highRiskPrs}</td>
                <td className="cell-right cell-mono">{repository.criticalIssues}</td>
                <td className="cell-right cell-mono">{repository.reviewBottlenecks}</td>
                <td className="cell-right cell-mono">{repository.hotspotFiles}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </article>
    </section>
  );
}
