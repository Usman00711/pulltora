import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/intelligence/empty-state';
import { SkeletonPanel } from '@/components/intelligence/skeleton-panel';
import { StatusBadge } from '@/components/intelligence/status-badge';
import { repositoryService } from '@/services/repository-service';

const issueFilters = ['ALL', 'STALE', 'CRITICAL'] as const;
type IssueFilter = (typeof issueFilters)[number];

export default function RepositoryIssuesPage() {
  const { id = 'unknown' } = useParams<{ id: string }>();
  const [issueFilter, setIssueFilter] = useState<IssueFilter>('ALL');
  const [search, setSearch] = useState('');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['repositoryIssues', id],
    queryFn: () => repositoryService.listIssues(id),
    enabled: Boolean(id)
  });

  if (isLoading) {
    return <SkeletonPanel rows={6} />;
  }

  if (isError) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Repository Issues</h1>
        <p className="text-sm text-red-300">{error instanceof Error ? error.message : 'Failed to load issues.'}</p>
        <button className="btn-soft" onClick={() => void refetch()}>
          Retry
        </button>
      </section>
    );
  }

  const issues = data?.items ?? [];
  const normalizedSearch = search.trim().toLowerCase();
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      !normalizedSearch ||
      issue.title.toLowerCase().includes(normalizedSearch) ||
      issue.author.toLowerCase().includes(normalizedSearch) ||
      (issue.assignee || '').toLowerCase().includes(normalizedSearch) ||
      issue.labels.join(' ').toLowerCase().includes(normalizedSearch);

    if (!matchesSearch) return false;
    if (issueFilter === 'STALE') return issue.isStale;
    if (issueFilter === 'CRITICAL') return issue.isCritical;
    return true;
  });

  return (
    <section className="space-y-4">
      <div className="page-title">
        <div>
          <p className="kpi-badge">Issue Intelligence</p>
          <h1 className="mt-2 text-3xl font-bold">Repository Issues</h1>
          <p className="text-sm text-muted-foreground">Synced snapshot records from GitHub issues for this repository.</p>
        </div>
        <Link className="btn-soft" to={`/repositories/${id}`}>
          Back
        </Link>
      </div>

      <input
        className="glass-input"
        placeholder="Search issues, labels, authors..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        {issueFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={filter === issueFilter ? 'btn-soft border-brand text-brand-foreground' : 'btn-soft'}
            onClick={() => setIssueFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {issues.length === 0 ? (
        <EmptyState
          title="No standalone issues returned"
          description="GitHub returned 0 standalone issues for this repository. Pull requests are filtered out of the GitHub issues response."
        />
      ) : filteredIssues.length === 0 ? (
        <EmptyState
          title="No matching issues"
          description="No issues match the selected search and filters. Run Analyze Repository after sync to refresh issue intelligence."
        />
      ) : (
        <article className="subtle-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Author</th>
                <th className="py-2 pr-4">Assignee</th>
                <th className="py-2 pr-4">State</th>
                <th className="py-2 pr-4">Flags</th>
                <th className="py-2 pr-4">Labels</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => (
                <tr key={issue.id} className="border-t border-slate-800/60">
                  <td className="py-2 pr-4">{issue.number}</td>
                  <td className="py-2 pr-4">
                    <a href={issue.url} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">
                      {issue.title}
                    </a>
                  </td>
                  <td className="py-2 pr-4">{issue.author}</td>
                  <td className="py-2 pr-4">{issue.assignee || '—'}</td>
                  <td className="py-2 pr-4">{issue.state}</td>
                  <td className="space-x-2 py-2 pr-4">
                    {issue.isStale ? (
                      <StatusBadge label="STALE" tone="amber" />
                    ) : null}
                    {issue.isCritical ? (
                      <StatusBadge label="CRITICAL" tone="rose" />
                    ) : null}
                    {!issue.isStale && !issue.isCritical ? '—' : null}
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {issue.labels.length
                        ? issue.labels.map((label) => (
                            <span key={label} className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">
                              {label}
                            </span>
                          ))
                        : '—'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      <p className="text-xs text-muted-foreground">Total synced: {data?.total ?? 0}</p>
    </section>
  );
}
