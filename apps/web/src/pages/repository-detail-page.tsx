import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HealthScoreCard } from '@/components/intelligence/health-score-card';
import { MetricCard } from '@/components/intelligence/metric-card';
import { SkeletonPanel } from '@/components/intelligence/skeleton-panel';
import { getHealthTone, StatusBadge } from '@/components/intelligence/status-badge';
import { useToast } from '@/components/intelligence/toast';
import { repositoryService } from '@/services/repository-service';

const sectionLinks = [
  { label: 'Overview', to: '' },
  { label: 'Pull Requests', to: 'pull-requests' },
  { label: 'Issues', to: 'issues' },
  { label: 'Reviews', to: 'reviews' },
  { label: 'Workload', to: 'workload' },
  { label: 'Hotspots', to: 'hotspots' },
  { label: 'Release Readiness', to: 'release-readiness' },
  { label: 'Technical Debt', to: 'technical-debt' },
  { label: 'Weekly Digest', to: 'weekly-digest' }
];

export default function RepositoryDetailPage() {
  const { id = 'unknown' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['repository', id],
    queryFn: () => repositoryService.getById(id),
    enabled: Boolean(id)
  });

  const pullRequestQuery = useQuery({
    queryKey: ['repositoryPullRequests', id],
    queryFn: () => repositoryService.listPullRequests(id),
    enabled: Boolean(id)
  });

  const issueQuery = useQuery({
    queryKey: ['repositoryIssues', id],
    queryFn: () => repositoryService.listIssues(id),
    enabled: Boolean(id)
  });

  const contributorQuery = useQuery({
    queryKey: ['repositoryContributors', id],
    queryFn: () => repositoryService.listContributors(id),
    enabled: Boolean(id)
  });

  const riskQuery = useQuery({
    queryKey: ['repositoryRisks', id],
    queryFn: () => repositoryService.getRisks(id),
    enabled: Boolean(id)
  });

  const insightQuery = useQuery({
    queryKey: ['repositoryInsights', id],
    queryFn: () => repositoryService.listRepositoryInsights(id),
    enabled: Boolean(id)
  });

  const healthQuery = useQuery({
    queryKey: ['repositoryHealth', id],
    queryFn: () => repositoryService.getRepositoryHealth(id),
    enabled: Boolean(id)
  });

  const syncedCounts = useMemo(() => {
    return {
      pullRequests: pullRequestQuery.data?.total ?? 0,
      issues: issueQuery.data?.total ?? 0,
      contributors: contributorQuery.data?.total ?? 0
    };
  }, [pullRequestQuery.data?.total, issueQuery.data?.total, contributorQuery.data?.total]);

  const previewPullRequests = pullRequestQuery.data?.items.slice(0, 3) ?? [];
  const previewIssues = issueQuery.data?.items.slice(0, 3) ?? [];
  const previewContributors = contributorQuery.data?.items.slice(0, 4) ?? [];

  const deleteMutation = useMutation({
    mutationFn: () => repositoryService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['repositories'] });
      navigate('/repositories');
    }
  });

  const syncMutation = useMutation({
    mutationFn: () => repositoryService.syncRepository(id),
    onSuccess: async () => {
      showToast('GitHub sync complete', 'success');

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['repository', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryHealth', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryPullRequests', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryIssues', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryContributors', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryRisks', id] })
      ]);
    },
    onError: (syncErr) => {
      const message =
        syncErr instanceof Error ? syncErr.message : 'Failed to sync repository with GitHub';

      if (/rate.?limit|rate limit/i.test(message)) {
        setSyncError('GitHub rate limit reached. Add a GITHUB_TOKEN or try again later.');
        showToast('GitHub rate limit reached. Add a GITHUB_TOKEN or try again later.', 'error');
        return;
      }

      if (/not found/i.test(message)) {
        showToast('GitHub repository not found', 'error');
        return;
      }

      showToast('Unable to sync repository', 'error');
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: () => repositoryService.analyzeRepository(id),
    onSuccess: async () => {
      showToast('Repository analysis complete', 'success');

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['repositoryHealth', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryPullRequests', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryIssues', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryContributors', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryHotspots', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryReviewBottlenecks', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryRisks', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryWorkloadSummary', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryInsights', id] })
      ]);
    },
    onError: (analysisErr) => {
      const message =
        analysisErr instanceof Error ? analysisErr.message : 'Failed to analyze repository';
      showToast(message, 'error');
    }
  });

  const insightMutation = useMutation({
    mutationFn: () => repositoryService.generateRepositoryInsights(id),
    onSuccess: async () => {
      showToast('Improvement ideas refreshed', 'success');
      await queryClient.invalidateQueries({ queryKey: ['repositoryInsights', id] });
    },
    onError: (insightErr) => {
      const message =
        insightErr instanceof Error ? insightErr.message : 'Failed to refresh improvement ideas';
      showToast(message, 'error');
    }
  });

  const handleDelete = () => {
    const confirmDelete = window.confirm('Delete this repository? This action cannot be undone.');
    if (!confirmDelete) {
      return;
    }

    deleteMutation.mutate();
  };

  const handleSync = () => {
    syncMutation.mutate();
  };

  const handleAnalyze = () => {
    analyzeMutation.mutate();
  };

  const handleRefreshInsights = () => {
    insightMutation.mutate();
  };

  if (isLoading) {
    return <SkeletonPanel rows={6} />;
  }

  if (isError) {
    return (
      <section className="space-y-3">
        <p className="text-sm text-red-300">{error instanceof Error ? error.message : 'Failed to load repository.'}</p>
        <button className="btn-soft" onClick={() => void refetch()}>
          Retry
        </button>
      </section>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Repository not found.</p>;
  }

  return (
    <section className="space-y-5">
      <div className="page-title motion-rise">
        <div>
          <p className="kpi-badge">Repository Workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{data.fullName}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{data.description || 'No description added yet.'}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="status-pill status-ok">{data.language || 'Unknown stack'}</span>
            <span className="status-pill">Default: {data.defaultBranch || 'main'}</span>
            <span className="status-pill">{data.stars} stars</span>
            <span className="status-pill">{data.forks} forks</span>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? 'Syncing...' : 'Sync GitHub Data'}
          </button>
          <button
            type="button"
            className="btn-soft"
            onClick={handleAnalyze}
            disabled={!data.lastSyncedAt || analyzeMutation.isPending}
            title={!data.lastSyncedAt ? 'Sync GitHub data before analysis' : undefined}
          >
            {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Repository'}
          </button>
          <a className="btn-soft" href={data.url} target="_blank" rel="noreferrer">
            Open on GitHub
          </a>
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {healthQuery.data ? (
            <HealthScoreCard
              score={healthQuery.data.score}
              level={healthQuery.data.level}
              reasons={healthQuery.data.reasons}
            />
          ) : (
            <SkeletonPanel rows={2} />
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
          <article className="panel glow-border p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Sync Status</p>
            <div className="mt-4">
              <StatusBadge label={data.lastSyncedAt ? 'Synced' : 'Never Synced'} tone={data.lastSyncedAt ? 'green' : 'amber'} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {data.lastSyncedAt ? new Date(data.lastSyncedAt).toLocaleString() : 'Run GitHub sync to collect snapshots.'}
            </p>
          </article>
          <article className="panel glow-border p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Analyze Status</p>
            <div className="mt-4">
              <StatusBadge
                label={healthQuery.data?.lastAnalyzedAt ? 'Analyzed' : data.lastSyncedAt ? 'Ready' : 'Blocked'}
                tone={healthQuery.data?.lastAnalyzedAt ? 'cyan' : data.lastSyncedAt ? 'violet' : 'amber'}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {healthQuery.data?.lastAnalyzedAt ? new Date(healthQuery.data.lastAnalyzedAt).toLocaleString() : 'Analyze after sync to score risks.'}
            </p>
          </article>
          <article className="panel glow-border p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Health Level</p>
            <div className="mt-4">
              {healthQuery.data ? (
                <StatusBadge label={healthQuery.data.level.replace('_', ' ')} tone={getHealthTone(healthQuery.data.level)} />
              ) : (
                <StatusBadge label="Pending" tone="slate" />
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Calculated from PRs, issues, reviews, workload, and hotspots.</p>
          </article>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Pull requests synced" value={syncedCounts.pullRequests} tone="cyan" />
        <MetricCard label="Issues synced" value={syncedCounts.issues} tone="violet" />
        <MetricCard label="Contributors synced" value={syncedCounts.contributors} tone="green" />
        <MetricCard
          label="Last synced"
          value={data.lastSyncedAt ? 'Ready' : 'Pending'}
          detail={data.lastSyncedAt ? new Date(data.lastSyncedAt).toLocaleString() : 'Run GitHub sync to collect data'}
          tone={data.lastSyncedAt ? 'green' : 'amber'}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="High-risk PRs" value={riskQuery.data?.highRiskPrs ?? 0} tone="amber" />
        <MetricCard label="Critical PRs" value={riskQuery.data?.criticalPrs ?? 0} tone="rose" />
        <MetricCard label="Stale issues" value={riskQuery.data?.staleIssues ?? 0} tone="violet" />
        <MetricCard label="Critical issues" value={riskQuery.data?.criticalIssues ?? 0} tone="rose" />
        <MetricCard label="Hotspots" value={riskQuery.data?.hotspotFiles ?? 0} tone="cyan" />
      </section>

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
            onClick={handleRefreshInsights}
            disabled={!data.lastSyncedAt || insightMutation.isPending}
            title={!data.lastSyncedAt ? 'Sync and analyze before generating ideas' : undefined}
          >
            {insightMutation.isPending ? 'Refreshing...' : 'Refresh Ideas'}
          </button>
        </div>

        {insightQuery.isLoading ? (
          <SkeletonPanel rows={3} />
        ) : insightQuery.isError ? (
          <p className="text-sm text-red-300">
            {insightQuery.error instanceof Error
              ? insightQuery.error.message
              : 'Failed to load improvement ideas.'}
          </p>
        ) : insightQuery.data?.items.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {insightQuery.data.items.slice(0, 6).map((insight) => {
              const impactTone =
                insight.impact === 'CRITICAL'
                  ? 'text-red-300 border-red-400/40 bg-red-400/10'
                  : insight.impact === 'HIGH'
                    ? 'text-amber-200 border-amber-300/40 bg-amber-300/10'
                    : insight.impact === 'MEDIUM'
                      ? 'text-violet-200 border-violet-300/40 bg-violet-300/10'
                      : 'text-emerald-200 border-emerald-300/40 bg-emerald-300/10';

              return (
                <div
                  key={insight.id}
                  className="surface-float rounded-2xl border border-border/70 bg-background/45 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-brand/50 hover:bg-brand/10"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${impactTone}`}>
                      {insight.impact}
                    </span>
                    <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                      {insight.category.replace('_', ' ')}
                    </span>
                    <span className="rounded-full border border-border/80 bg-muted/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {insight.source === 'LOCAL_AI' ? 'Local AI' : 'Rules'} · {insight.confidence}%
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
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/80 bg-background/45 p-5 text-sm text-muted-foreground">
            Run Analyze Repository after syncing GitHub data to generate improvement ideas.
          </div>
        )}
      </article>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Pull Requests</h2>
            <Link className="text-xs font-semibold text-brand hover:text-brand-foreground" to={`/repositories/${id}/pull-requests`}>
              View all
            </Link>
          </div>

          {pullRequestQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading pull requests...</p>
          ) : previewPullRequests.length > 0 ? (
            <div className="space-y-3">
              {previewPullRequests.map((pullRequest) => (
                <a
                  key={pullRequest.id}
                  href={pullRequest.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-border/70 bg-background/45 p-3 transition hover:border-brand/50 hover:bg-brand/10"
                >
                  <p className="text-sm font-semibold">#{pullRequest.number} {pullRequest.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pullRequest.state} by {pullRequest.author} · {pullRequest.filesChanged} files · {pullRequest.reviewCount} reviews
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No pull requests were returned by GitHub for this repository yet.
            </p>
          )}
        </article>

        <article className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Issues</h2>
            <Link className="text-xs font-semibold text-brand hover:text-brand-foreground" to={`/repositories/${id}/issues`}>
              View all
            </Link>
          </div>

          {issueQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading issues...</p>
          ) : previewIssues.length > 0 ? (
            <div className="space-y-3">
              {previewIssues.map((issue) => (
                <a
                  key={issue.id}
                  href={issue.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-border/70 bg-background/45 p-3 transition hover:border-brand/50 hover:bg-brand/10"
                >
                  <p className="text-sm font-semibold">#{issue.number} {issue.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {issue.state} by {issue.author}
                    {issue.assignee ? ` · assigned to ${issue.assignee}` : ''}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No standalone issues were returned. GitHub PRs are filtered out of the issues feed.
            </p>
          )}
        </article>

        <article className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Contributors</h2>
            <Link className="text-xs font-semibold text-brand hover:text-brand-foreground" to={`/repositories/${id}/workload`}>
              View workload
            </Link>
          </div>

          {contributorQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading contributors...</p>
          ) : previewContributors.length > 0 ? (
            <div className="space-y-3">
              {previewContributors.map((contributor) => (
                <a
                  key={contributor.id}
                  href={contributor.profileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/45 p-3 transition hover:border-brand/50 hover:bg-brand/10"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{contributor.username}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {contributor.openPrs} open PRs · {contributor.assignedIssues} assigned issues
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-foreground">{contributor.commits} commits</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No contributors were returned by GitHub for this repository.
            </p>
          )}
        </article>
      </section>

      <article className="panel p-5">
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <p className="text-muted-foreground">
            Owner: <span className="text-foreground font-semibold">{data.owner}</span>
          </p>
          <p className="text-muted-foreground">
            Name: <span className="text-foreground font-semibold">{data.name}</span>
          </p>
          <p className="text-muted-foreground">
            Full name: <span className="text-foreground font-semibold">{data.fullName}</span>
          </p>
        </div>
      </article>

      <nav className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sectionLinks.map((section) => (
          <Link
            key={section.label}
            to={section.to ? `/repositories/${id}/${section.to}` : `/repositories/${id}`}
            className="section-tile text-center text-sm font-semibold hover-lift"
          >
            {section.label}
          </Link>
        ))}
      </nav>

      <div className="panel p-4 text-sm text-muted-foreground">
        Select a domain above to inspect pull requests, workload, hotspots, and release-readiness in depth.
      </div>
    </section>
  );
}
