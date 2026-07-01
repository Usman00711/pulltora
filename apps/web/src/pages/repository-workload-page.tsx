export default function RepositoryWorkloadPage() {
  return (
    <section className="space-y-5">
      <div className="page-title">
        <div>
          <p className="kpi-badge">Team Load Balance</p>
          <h1 className="mt-2 text-3xl font-bold">Repository Workload</h1>
          <p className="text-sm text-muted-foreground">Work distribution and contribution heatmap signals.</p>
        </div>
      </div>
      <article className="subtle-card p-6 text-sm text-muted-foreground">
        No workload data synced yet.
      </article>
    </section>
  );
}
