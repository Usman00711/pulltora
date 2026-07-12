import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard } from '@/components/intelligence/chart-card';
import { EmptyState } from '@/components/intelligence/empty-state';
import { SkeletonPanel } from '@/components/intelligence/skeleton-panel';
import { getWorkloadTone, StatusBadge } from '@/components/intelligence/status-badge';
import { repositoryService } from '@/services/repository-service';

export default function RepositoryWorkloadPage() {
  const { id = 'unknown' } = useParams<{ id: string }>();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['repositoryWorkloadSummary', id],
    queryFn: () => repositoryService.getWorkloadSummary(id),
    enabled: Boolean(id)
  });

  if (isLoading) {
    return <SkeletonPanel rows={6} />;
  }

  if (isError) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Repository Workload</h1>
        <p className="text-sm text-red-300">{error instanceof Error ? error.message : 'Failed to load contributor workload.'}</p>
        <button className="btn-soft" onClick={() => void refetch()}>
          Retry
        </button>
      </section>
    );
  }

  const contributors = data?.items ?? [];
  const totals = data?.totals;
  const workloadChart = totals
    ? [
        { name: 'Balanced', value: totals.balanced },
        { name: 'Busy', value: totals.busy },
        { name: 'Overloaded', value: totals.overloaded },
        { name: 'At Risk', value: totals.atRisk }
      ]
    : [];

  return (
    <section className="space-y-4">
      <div className="page-title">
        <div>
          <p className="kpi-badge">Team Load Balance</p>
          <h1 className="mt-2 text-3xl font-bold">Repository Workload</h1>
          <p className="text-sm text-muted-foreground">Contributor snapshot records from GitHub.</p>
        </div>
        <Link className="btn-soft" to={`/repositories/${id}`}>
          Back
        </Link>
      </div>

      {totals ? (
        <section className="grid gap-3 sm:grid-cols-4">
          <article className="panel p-4">
            <p className="text-xs text-muted-foreground">Balanced</p>
            <p className="mt-2 text-2xl font-bold">{totals.balanced}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs text-muted-foreground">Busy</p>
            <p className="mt-2 text-2xl font-bold">{totals.busy}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs text-muted-foreground">Overloaded</p>
            <p className="mt-2 text-2xl font-bold">{totals.overloaded}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs text-muted-foreground">At risk</p>
            <p className="mt-2 text-2xl font-bold">{totals.atRisk}</p>
          </article>
        </section>
      ) : null}

      <ChartCard title="Workload Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={workloadChart}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#080b12', border: '1px solid #253044', color: '#e5faff' }} />
            <Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {contributors.length === 0 ? (
        <EmptyState
          title="No contributor workload yet"
          description="Sync GitHub data and run Analyze Repository to calculate contributor workload."
        />
      ) : (
        <article className="subtle-card data-table-card">
          <table className="data-table min-w-[980px]">
            <thead>
              <tr>
                <th className="cell-title">Contributor</th>
                <th className="cell-right w-24">Commits</th>
                <th className="cell-right w-24">Open PRs</th>
                <th className="cell-right w-36">Assigned issues</th>
                <th className="cell-right w-36">Pending reviews</th>
                <th className="cell-right w-28">Stale items</th>
                <th className="cell-right w-28">Load score</th>
                <th className="cell-status w-40">Level</th>
              </tr>
            </thead>
            <tbody>
              {contributors.map((contributor) => (
                <tr key={contributor.id} className="data-table-row">
                  <td className="cell-title font-semibold">{contributor.username}</td>
                  <td className="cell-right cell-mono">{contributor.commits}</td>
                  <td className="cell-right cell-mono">{contributor.openPrs}</td>
                  <td className="cell-right cell-mono">{contributor.assignedIssues}</td>
                  <td className="cell-right cell-mono">{contributor.pendingReviews}</td>
                  <td className="cell-right cell-mono">{contributor.staleItems}</td>
                  <td className="cell-right cell-mono">{contributor.workloadScore}</td>
                  <td className="cell-status">
                    <StatusBadge label={contributor.workloadLevel.replace('_', ' ')} tone={getWorkloadTone(contributor.workloadLevel)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      <p className="text-xs text-muted-foreground">Total contributors: {contributors.length}</p>
    </section>
  );
}
