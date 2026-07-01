export default function RepositoryHotspotsPage() {
  return (
    <section className="space-y-5">
      <div className="page-title">
        <div>
          <p className="kpi-badge">Hotspot Analysis</p>
          <h1 className="mt-2 text-3xl font-bold">Repository Hotspots</h1>
          <p className="text-sm text-muted-foreground">Frequently changing files and conflict-prone modules.</p>
        </div>
      </div>
      <article className="subtle-card p-6 text-sm text-muted-foreground">
        No hotspot data synced yet.
      </article>
    </section>
  );
}
