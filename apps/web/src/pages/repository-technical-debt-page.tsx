export default function RepositoryTechnicalDebtPage() {
  return (
    <section className="space-y-5">
      <div className="page-title">
        <div>
          <p className="kpi-badge">Technical Debt Radar</p>
          <h1 className="mt-2 text-3xl font-bold">Technical Debt Radar</h1>
          <p className="text-sm text-muted-foreground">Debt hotspots, stale comments, and refactor opportunities.</p>
        </div>
      </div>
      <article className="subtle-card p-6 text-sm text-muted-foreground">
        No technical debt data synced yet.
      </article>
    </section>
  );
}
