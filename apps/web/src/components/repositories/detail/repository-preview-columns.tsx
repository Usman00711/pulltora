import { Link } from 'react-router-dom';
import { ContributorSnapshot, IssueSnapshot, PullRequestSnapshot } from '@devpulse/shared';

interface RepositoryPreviewColumnsProps {
  repositoryId: string;
  pullRequests: PullRequestSnapshot[];
  issues: IssueSnapshot[];
  contributors: ContributorSnapshot[];
  isPullRequestsLoading: boolean;
  isIssuesLoading: boolean;
  isContributorsLoading: boolean;
}

export function RepositoryPreviewColumns({
  repositoryId,
  pullRequests,
  issues,
  contributors,
  isPullRequestsLoading,
  isIssuesLoading,
  isContributorsLoading
}: RepositoryPreviewColumnsProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <article className="panel p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Pull Requests</h2>
          <Link className="text-xs font-semibold text-brand hover:text-brand-foreground" to={`/repositories/${repositoryId}/pull-requests`}>
            View all
          </Link>
        </div>

        {isPullRequestsLoading ? (
          <p className="text-sm text-muted-foreground">Loading pull requests...</p>
        ) : pullRequests.length > 0 ? (
          <div className="space-y-3">
            {pullRequests.map((pullRequest) => (
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
          <p className="text-sm text-muted-foreground">No pull requests were returned by GitHub for this repository yet.</p>
        )}
      </article>

      <article className="panel p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Issues</h2>
          <Link className="text-xs font-semibold text-brand hover:text-brand-foreground" to={`/repositories/${repositoryId}/issues`}>
            View all
          </Link>
        </div>

        {isIssuesLoading ? (
          <p className="text-sm text-muted-foreground">Loading issues...</p>
        ) : issues.length > 0 ? (
          <div className="space-y-3">
            {issues.map((issue) => (
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
          <p className="text-sm text-muted-foreground">No standalone issues were returned. GitHub PRs are filtered out of the issues feed.</p>
        )}
      </article>

      <article className="panel p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Contributors</h2>
          <Link className="text-xs font-semibold text-brand hover:text-brand-foreground" to={`/repositories/${repositoryId}/workload`}>
            View workload
          </Link>
        </div>

        {isContributorsLoading ? (
          <p className="text-sm text-muted-foreground">Loading contributors...</p>
        ) : contributors.length > 0 ? (
          <div className="space-y-3">
            {contributors.map((contributor) => (
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
          <p className="text-sm text-muted-foreground">No contributors were returned by GitHub for this repository.</p>
        )}
      </article>
    </section>
  );
}
