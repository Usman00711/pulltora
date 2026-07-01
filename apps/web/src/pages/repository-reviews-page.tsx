export default function RepositoryReviewsPage() {
  return (
    <section className="space-y-5">
      <div className="page-title">
        <div>
          <p className="kpi-badge">Review Bottlenecks</p>
          <h1 className="mt-2 text-3xl font-bold">Repository Reviews</h1>
          <p className="text-sm text-muted-foreground">Reviewer queue, review age, and merge latency risk.</p>
        </div>
      </div>
      <article className="subtle-card p-6 text-sm text-muted-foreground">
        No review queue data synced yet.
      </article>
    </section>
  );
}
