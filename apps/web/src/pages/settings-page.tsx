export default function SettingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="kpi-badge">Platform Settings</p>
        <h1 className="mt-2 text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Control workspace-level defaults and integrations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <p className="mt-2 text-sm text-muted-foreground">Alerts for critical PRs and stale review queues.</p>
          <button className="btn-soft mt-4">Configure</button>
        </div>
        <div className="panel p-5">
          <h2 className="text-sm font-semibold">Integrations</h2>
          <p className="mt-2 text-sm text-muted-foreground">GitHub app and sync preferences.</p>
          <button className="btn-soft mt-4">Connect</button>
        </div>
      </div>

      <article className="subtle-card p-6 text-sm text-muted-foreground">
        No settings configured yet.
      </article>
    </section>
  );
}
