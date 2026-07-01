export default function RepositoryPullRequestsPage() {
  return (
    <section className="space-y-5">
      <div className="page-title">
        <div>
          <p className="kpi-badge">PR Risk Intelligence</p>
          <h1 className="mt-2 text-3xl font-bold">Repository Pull Requests</h1>
          <p className="text-sm text-muted-foreground">High-risk, stale, and review-lagging PRs in one place.</p>
        </div>
      </div>
      <article className="subtle-card p-6 text-sm text-muted-foreground">No pull request data synced yet.</article>
    </section>
  );
}
