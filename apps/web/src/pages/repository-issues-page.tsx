export default function RepositoryIssuesPage() {
  return (
    <section className="space-y-5">
      <div className="page-title">
        <div>
          <p className="kpi-badge">Issue Intelligence</p>
          <h1 className="mt-2 text-3xl font-bold">Repository Issues</h1>
          <p className="text-sm text-muted-foreground">Critical and stale issues grouped by risk tier.</p>
        </div>
      </div>
      <article className="subtle-card p-6 text-sm text-muted-foreground">
        No issue intelligence synced yet.
      </article>
    </section>
  );
}
