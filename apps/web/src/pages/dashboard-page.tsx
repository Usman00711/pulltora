const metrics = [
  { label: 'High-risk PRs', value: '12', change: '+2 yesterday', tone: 'text-warning' },
  { label: 'Review Bottlenecks', value: '3', change: 'Needs balancing', tone: 'text-warning' },
  { label: 'Critical Issues', value: '1', change: '1 blocker', tone: 'text-danger' }
];

const focusItems = [
  'Sync cadence missed on acme/api-service (12m ago)',
  '2 stale PRs exceed reviewer SLA',
  'Front-end team workload above 18% imbalance'
];

const teams = [
  { team: 'Backend', trend: '▲ 9%' },
  { team: 'Frontend', trend: '▲ 3%' },
  { team: 'Platform', trend: '▼ 1%' }
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="page-title">
        <div>
          <p className="kpi-badge">Delivery Overview</p>
          <h1 className="mt-2 text-3xl font-black">Delivery Dashboard</h1>
          <p className="text-sm text-muted-foreground">A real-time snapshot of your repository health.</p>
        </div>
        <span className="kpi-badge status-ok">Auto-refresh Active</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="panel hover-lift p-5">
            <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
            <p className={`mt-3 text-4xl font-black ${metric.tone}`}>{metric.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{metric.change}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <article className="panel p-5">
          <p className="text-sm font-semibold">Top actions</p>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            {focusItems.map((item) => (
              <p key={item} className="section-tile">• {item}</p>
            ))}
          </div>
        </article>

        <article className="panel p-5 xl:col-span-2">
          <p className="text-sm font-semibold">Team workload trend</p>
          <div className="mt-4 grid gap-3">
            {teams.map((team) => (
              <div
                key={team.team}
                className="section-tile flex items-center justify-between text-sm"
              >
                <span className="font-medium text-foreground">{team.team}</span>
                <span className="text-muted-foreground">{team.trend}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
