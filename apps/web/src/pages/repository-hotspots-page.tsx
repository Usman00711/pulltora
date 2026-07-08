import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard } from '@/components/intelligence/chart-card';
import { EmptyState } from '@/components/intelligence/empty-state';
import { MetricCard } from '@/components/intelligence/metric-card';
import { SkeletonPanel } from '@/components/intelligence/skeleton-panel';
import { getScoreTone, StatusBadge } from '@/components/intelligence/status-badge';
import { repositoryService } from '@/services/repository-service';

export default function RepositoryHotspotsPage() {
  const { id = 'unknown' } = useParams<{ id: string }>();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['repositoryHotspots', id],
    queryFn: () => repositoryService.listHotspots(id),
    enabled: Boolean(id)
  });

  if (isLoading) {
    return <SkeletonPanel rows={6} />;
  }

  if (isError) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Repository Hotspots</h1>
        <p className="text-sm text-red-300">{error instanceof Error ? error.message : 'Failed to load hotspots.'}</p>
        <button className="btn-soft" onClick={() => void refetch()}>
          Retry
        </button>
      </section>
    );
  }

  const hotspots = data?.items ?? [];
  const moduleMap = hotspots.reduce<Record<string, number>>((acc, hotspot) => {
    acc[hotspot.module] = (acc[hotspot.module] || 0) + 1;
    return acc;
  }, {});
  const moduleChart = Object.entries(moduleMap).map(([name, value]) => ({ name, value }));
  const topModules = moduleChart.slice(0, 4);

  return (
    <section className="space-y-4">
      <div className="page-title">
        <div>
          <p className="kpi-badge">Hotspot Analysis</p>
          <h1 className="mt-2 text-3xl font-bold">Repository Hotspots</h1>
          <p className="text-sm text-muted-foreground">Frequently changing files and conflict-prone modules.</p>
        </div>
        <Link className="btn-soft" to={`/repositories/${id}`}>
          Back
        </Link>
      </div>

      {topModules.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topModules.map((module) => (
            <MetricCard key={module.name} label={module.name} value={module.value} tone="violet" />
          ))}
        </section>
      ) : null}

      <ChartCard title="Hotspot Modules">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={moduleChart}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#080b12', border: '1px solid #253044', color: '#e5faff' }} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {hotspots.length === 0 ? (
        <EmptyState
          title="No hotspot files yet"
          description="Run Analyze Repository after syncing pull request data to calculate hotspot files."
        />
      ) : (
        <article className="subtle-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">File</th>
                <th className="py-2 pr-4">Module</th>
                <th className="py-2 pr-4">Changes</th>
                <th className="py-2 pr-4">Risk score</th>
                <th className="py-2 pr-4">Related PRs</th>
              </tr>
            </thead>
            <tbody>
              {hotspots.map((hotspot) => (
                <tr key={hotspot.id} className="border-t border-slate-800/60">
                  <td className="max-w-md break-all py-2 pr-4 font-semibold">{hotspot.filePath}</td>
                  <td className="py-2 pr-4">{hotspot.module}</td>
                  <td className="py-2 pr-4">{hotspot.changeCount}</td>
                  <td className="py-2 pr-4">
                    <StatusBadge label={String(hotspot.riskScore)} tone={getScoreTone(hotspot.riskScore)} />
                  </td>
                  <td className="py-2 pr-4">{hotspot.relatedPrNumbers.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      <p className="text-xs text-muted-foreground">Total hotspots: {data?.total ?? 0}</p>
    </section>
  );
}
