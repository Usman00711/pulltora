import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/intelligence/empty-state';
import { SkeletonPanel } from '@/components/intelligence/skeleton-panel';
import { repositoryService } from '@/services/repository-service';

export default function RepositoryReviewsPage() {
  const { id = 'unknown' } = useParams<{ id: string }>();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['repositoryReviewBottlenecks', id],
    queryFn: () => repositoryService.getReviewBottlenecks(id),
    enabled: Boolean(id)
  });

  if (isLoading) {
    return <SkeletonPanel rows={6} />;
  }

  if (isError) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Repository Reviews</h1>
        <p className="text-sm text-red-300">{error instanceof Error ? error.message : 'Failed to load review bottlenecks.'}</p>
        <button className="btn-soft" onClick={() => void refetch()}>
          Retry
        </button>
      </section>
    );
  }

  const items = data?.items ?? [];

  return (
    <section className="space-y-4">
      <div className="page-title">
        <div>
          <p className="kpi-badge">Review Bottlenecks</p>
          <h1 className="mt-2 text-3xl font-bold">Repository Reviews</h1>
          <p className="text-sm text-muted-foreground">Reviewer queue, review age, and merge latency risk.</p>
        </div>
        <Link className="btn-soft" to={`/repositories/${id}`}>
          Back
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-4">
        <article className="panel p-4">
          <p className="text-xs text-muted-foreground">Unreviewed PRs</p>
          <p className="mt-2 text-2xl font-bold">{data?.totalUnreviewedPrs ?? 0}</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs text-muted-foreground">Stale unreviewed</p>
          <p className="mt-2 text-2xl font-bold">{data?.staleUnreviewedPrs ?? 0}</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs text-muted-foreground">Oldest age</p>
          <p className="mt-2 text-2xl font-bold">{data?.oldestUnreviewedPr?.ageDays ?? 0}d</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs text-muted-foreground">Average age</p>
          <p className="mt-2 text-2xl font-bold">{data?.averageAgeDays ?? 0}d</p>
        </article>
      </section>

      {items.length === 0 ? (
        <EmptyState
          title="No review bottlenecks"
          description="No open unreviewed pull requests were found in the latest analyzed snapshot."
        />
      ) : (
        <article className="subtle-card data-table-card">
          <table className="data-table min-w-[860px]">
            <thead>
              <tr>
                <th className="cell-number">#</th>
                <th className="cell-title">Title</th>
                <th className="w-36">Author</th>
                <th className="cell-right w-24">Age</th>
                <th className="cell-right w-24">Files</th>
                <th className="cell-status w-32">Risk</th>
              </tr>
            </thead>
            <tbody>
              {items.map((pullRequest) => (
                <tr key={pullRequest.id} className="data-table-row">
                  <td className="cell-number">#{pullRequest.number}</td>
                  <td className="cell-title">
                    <a href={pullRequest.url} target="_blank" rel="noreferrer" title={pullRequest.title} className="cell-truncate font-semibold text-cyan-200 hover:text-cyan-100">
                      {pullRequest.title}
                    </a>
                  </td>
                  <td className="cell-truncate" title={pullRequest.author}>{pullRequest.author}</td>
                  <td className="cell-right cell-mono">{pullRequest.ageDays}d</td>
                  <td className="cell-right cell-mono">{pullRequest.filesChanged}</td>
                  <td className="cell-status">{pullRequest.riskLevel} · {pullRequest.riskScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}
    </section>
  );
}
