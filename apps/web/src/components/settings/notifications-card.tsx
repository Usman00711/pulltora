import { StatusBadge } from '@/components/intelligence/status-badge';

export function NotificationsCard() {
  return (
    <article className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kpi-badge">Alerts</p>
          <h2 className="mt-3 text-lg font-semibold">Notifications</h2>
        </div>
        <StatusBadge label="Coming Soon" tone="slate" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Alerts for critical PRs, stale reviews, issue risk, and weekly engineering digests will live here later.
      </p>
      <div className="mt-5 rounded-2xl border border-border/70 bg-background/45 p-4 text-sm">
        <p className="text-muted-foreground">Planned channels</p>
        <p className="mt-1 font-semibold text-foreground">Email, Slack, Discord, and webhooks.</p>
      </div>
    </article>
  );
}
