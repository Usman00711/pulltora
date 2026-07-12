import { RepositoryInsightListResponse } from '@devpulse/shared';
import { SkeletonPanel } from '@/components/intelligence/skeleton-panel';
import { getInsightImpactClass, getInsightSourceLabel } from './repository-detail.helpers';

interface RepositoryInsightsPanelProps {
  insights?: RepositoryInsightListResponse;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isRefreshing: boolean;
  canRefresh: boolean;
  onRefresh: () => void;
}

export function RepositoryInsightsPanel({
  insights,
  isLoading,
  isError,
  error,
  isRefreshing,
  canRefresh,
  onRefresh
}: RepositoryInsightsPanelProps) {
  return (
    <article className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kpi-badge">AI Improvement Ideas</p>
          <h2 className="mt-2 text-xl font-bold">Betterment recommendations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated from Pulltora analysis data. Local AI can enrich these later, but rule-based ideas work for free by default.
          </p>
        </div>
        <button
          type="button"
          className="btn-soft"
          onClick={onRefresh}
          disabled={!canRefresh || isRefreshing}
          title={!canRefresh ? 'Sync and analyze before generating ideas' : undefined}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Ideas'}
        </button>
      </div>

      {isLoading ? (
        <SkeletonPanel rows={3} />
      ) : isError ? (
        <p className="text-sm text-red-300">
          {error instanceof Error ? error.message : 'Failed to load improvement ideas.'}
        </p>
      ) : insights?.items.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {insights.items.slice(0, 6).map((insight) => (
            <div
              key={insight.id}
              className="surface-float rounded-2xl border border-border/70 bg-background/45 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-brand/50 hover:bg-brand/10"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${getInsightImpactClass(insight.impact)}`}>
                  {insight.impact}
                </span>
                <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                  {insight.category.replace('_', ' ')}
                </span>
                <span className="rounded-full border border-border/80 bg-muted/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {getInsightSourceLabel(insight.source)} · {insight.confidence}%
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold">{insight.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{insight.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Why:</span> {insight.rationale}
              </p>
              {insight.relatedFiles.length || insight.relatedPrNumbers.length || insight.relatedIssueNumbers.length ? (
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  {insight.relatedFiles.length ? (
                    <p>
                      Files: <span className="text-foreground">{insight.relatedFiles.slice(0, 4).join(', ')}</span>
                    </p>
                  ) : null}
                  {insight.relatedPrNumbers.length ? (
                    <p>
                      PRs: <span className="text-foreground">{insight.relatedPrNumbers.map((number) => `#${number}`).join(', ')}</span>
                    </p>
                  ) : null}
                  {insight.relatedIssueNumbers.length ? (
                    <p>
                      Issues: <span className="text-foreground">{insight.relatedIssueNumbers.map((number) => `#${number}`).join(', ')}</span>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-background/45 p-5 text-sm text-muted-foreground">
          Run Analyze Repository after syncing GitHub data to generate improvement ideas.
        </div>
      )}
    </article>
  );
}
