import { Repository } from '@devpulse/shared';
import { MetricCard } from '@/components/intelligence/metric-card';

interface RepositorySyncMetricsProps {
  repository: Repository;
  counts: {
    pullRequests: number;
    issues: number;
    contributors: number;
  };
}

export function RepositorySyncMetrics({ repository, counts }: RepositorySyncMetricsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label="Pull requests synced" value={counts.pullRequests} tone="cyan" />
      <MetricCard label="Issues synced" value={counts.issues} tone="violet" />
      <MetricCard label="Contributors synced" value={counts.contributors} tone="green" />
      <MetricCard
        label="Last synced"
        value={repository.lastSyncedAt ? 'Ready' : 'Pending'}
        detail={repository.lastSyncedAt ? new Date(repository.lastSyncedAt).toLocaleString() : 'Run GitHub sync to collect data'}
        tone={repository.lastSyncedAt ? 'green' : 'amber'}
      />
    </section>
  );
}
