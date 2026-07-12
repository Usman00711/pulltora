import { RiskSummary } from '@devpulse/shared';
import { MetricCard } from '@/components/intelligence/metric-card';

interface RepositoryRiskMetricsProps {
  risk?: RiskSummary;
}

export function RepositoryRiskMetrics({ risk }: RepositoryRiskMetricsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <MetricCard label="High-risk PRs" value={risk?.highRiskPrs ?? 0} tone="amber" />
      <MetricCard label="Critical PRs" value={risk?.criticalPrs ?? 0} tone="rose" />
      <MetricCard label="Stale issues" value={risk?.staleIssues ?? 0} tone="violet" />
      <MetricCard label="Critical issues" value={risk?.criticalIssues ?? 0} tone="rose" />
      <MetricCard label="Hotspots" value={risk?.hotspotFiles ?? 0} tone="cyan" />
    </section>
  );
}
