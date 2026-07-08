import { Fragment, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PullRequestRiskLevel } from '@devpulse/shared';
import { EmptyState } from '@/components/intelligence/empty-state';
import { SkeletonPanel } from '@/components/intelligence/skeleton-panel';
import { getRiskTone, StatusBadge } from '@/components/intelligence/status-badge';
import { repositoryService } from '@/services/repository-service';

const riskFilters: Array<'ALL' | PullRequestRiskLevel> = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const stateFilters = ['ALL', 'open', 'closed'] as const;

export default function RepositoryPullRequestsPage() {
  const { id = 'unknown' } = useParams<{ id: string }>();
  const [riskFilter, setRiskFilter] = useState<'ALL' | PullRequestRiskLevel>('ALL');
  const [stateFilter, setStateFilter] = useState<(typeof stateFilters)[number]>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['repositoryPullRequests', id],
    queryFn: () => repositoryService.listPullRequests(id),
    enabled: Boolean(id)
  });

  if (isLoading) {
    return <SkeletonPanel rows={6} />;
  }

  if (isError) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Repository Pull Requests</h1>
        <p className="text-sm text-red-300">{error instanceof Error ? error.message : 'Failed to load pull requests.'}</p>
        <button className="btn-soft" onClick={() => void refetch()}>
          Retry
        </button>
      </section>
    );
  }

  const pullRequests = data?.items ?? [];
  const normalizedSearch = search.trim().toLowerCase();
  const filteredPullRequests = pullRequests.filter((pullRequest) => {
    const matchesRisk = riskFilter === 'ALL' || pullRequest.riskLevel === riskFilter;
    const matchesState = stateFilter === 'ALL' || pullRequest.state.toLowerCase() === stateFilter;
    const matchesSearch =
      !normalizedSearch ||
      pullRequest.title.toLowerCase().includes(normalizedSearch) ||
      pullRequest.author.toLowerCase().includes(normalizedSearch) ||
      String(pullRequest.number).includes(normalizedSearch) ||
      pullRequest.riskReasons.join(' ').toLowerCase().includes(normalizedSearch);

    return matchesRisk && matchesState && matchesSearch;
  });

  return (
    <section className="space-y-4">
      <div className="page-title">
        <div>
          <p className="kpi-badge">PR Intelligence</p>
          <h1 className="mt-2 text-3xl font-bold">Repository Pull Requests</h1>
          <p className="text-sm text-muted-foreground">Synced snapshot records from GitHub for this repository.</p>
        </div>
        <Link className="btn-soft" to={`/repositories/${id}`}>
          Back
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="glass-input min-w-64 flex-1"
          placeholder="Search PRs, authors, risk reasons..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {riskFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={filter === riskFilter ? 'btn-soft border-brand text-brand-foreground' : 'btn-soft'}
            onClick={() => setRiskFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {stateFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={filter === stateFilter ? 'btn-soft border-brand text-brand-foreground' : 'btn-soft'}
            onClick={() => setStateFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {pullRequests.length === 0 ? (
        <EmptyState
          title="No pull requests returned"
          description="GitHub returned 0 pull requests for this repository. That usually means changes were pushed directly to a branch instead of opened through PRs."
        />
      ) : filteredPullRequests.length === 0 ? (
        <EmptyState
          title="No matching pull requests"
          description="No pull requests match the selected search and filters. Run Analyze Repository after sync to refresh risk scores."
        />
      ) : (
        <article className="subtle-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Author</th>
                <th className="py-2 pr-4">State</th>
                <th className="py-2 pr-4">Files</th>
                <th className="py-2 pr-4">Reviews</th>
                <th className="py-2 pr-4">Risk</th>
                <th className="py-2 pr-4">Reasons</th>
              </tr>
            </thead>
            <tbody>
              {filteredPullRequests.map((pullRequest) => (
                <Fragment key={pullRequest.id}>
                  <tr className="border-t border-slate-800/60">
                    <td className="py-2 pr-4">{pullRequest.number}</td>
                    <td className="py-2 pr-4">
                      <a href={pullRequest.url} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">
                        {pullRequest.title}
                      </a>
                    </td>
                    <td className="py-2 pr-4">{pullRequest.author}</td>
                    <td className="py-2 pr-4">{pullRequest.state}</td>
                    <td className="py-2 pr-4">{pullRequest.filesChanged}</td>
                    <td className="py-2 pr-4">{pullRequest.reviewCount}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge label={`${pullRequest.riskLevel} · ${pullRequest.riskScore}`} tone={getRiskTone(pullRequest.riskLevel)} />
                    </td>
                    <td className="py-2 pr-4">
                      <button
                        type="button"
                        className="btn-soft text-xs"
                        onClick={() => setExpandedId(expandedId === pullRequest.id ? null : pullRequest.id)}
                      >
                        {expandedId === pullRequest.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === pullRequest.id ? (
                    <tr className="border-t border-slate-800/60 bg-cyan-400/5">
                      <td colSpan={8} className="px-4 py-3 text-xs text-muted-foreground">
                        {pullRequest.riskReasons.length ? pullRequest.riskReasons.join(' · ') : 'No risk reasons yet. Run Analyze Repository to refresh scoring.'}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </article>
      )}

      <p className="text-xs text-muted-foreground">Total synced: {data?.total ?? 0}</p>
    </section>
  );
}
