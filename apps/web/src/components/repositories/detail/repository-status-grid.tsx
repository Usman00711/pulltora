import { Repository, RepositoryHealth } from '@devpulse/shared';
import { HealthScoreCard } from '@/components/intelligence/health-score-card';
import { SkeletonPanel } from '@/components/intelligence/skeleton-panel';
import { getHealthTone, StatusBadge } from '@/components/intelligence/status-badge';

interface RepositoryStatusGridProps {
  repository: Repository;
  health?: RepositoryHealth;
}

export function RepositoryStatusGrid({ repository, health }: RepositoryStatusGridProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-1">
        {health ? (
          <HealthScoreCard score={health.score} level={health.level} reasons={health.reasons} />
        ) : (
          <SkeletonPanel rows={2} />
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
        <article className="panel glow-border p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Sync Status</p>
          <div className="mt-4">
            <StatusBadge label={repository.lastSyncedAt ? 'Synced' : 'Never Synced'} tone={repository.lastSyncedAt ? 'green' : 'amber'} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {repository.lastSyncedAt ? new Date(repository.lastSyncedAt).toLocaleString() : 'Run GitHub sync to collect snapshots.'}
          </p>
        </article>
        <article className="panel glow-border p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Analyze Status</p>
          <div className="mt-4">
            <StatusBadge
              label={health?.lastAnalyzedAt ? 'Analyzed' : repository.lastSyncedAt ? 'Ready' : 'Blocked'}
              tone={health?.lastAnalyzedAt ? 'cyan' : repository.lastSyncedAt ? 'violet' : 'amber'}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {health?.lastAnalyzedAt ? new Date(health.lastAnalyzedAt).toLocaleString() : 'Analyze after sync to score risks.'}
          </p>
        </article>
        <article className="panel glow-border p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Health Level</p>
          <div className="mt-4">
            {health ? (
              <StatusBadge label={health.level.replace('_', ' ')} tone={getHealthTone(health.level)} />
            ) : (
              <StatusBadge label="Pending" tone="slate" />
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Calculated from PRs, issues, reviews, workload, and hotspots.</p>
        </article>
      </div>
    </section>
  );
}
