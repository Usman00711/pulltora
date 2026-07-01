import { Link } from 'react-router-dom';

const quickSignals = [
  {
    label: 'PR Risk',
    value: 'Stable',
    detail: '0 high-risk alerts',
    tone: 'text-success'
  },
  {
    label: 'Review Flow',
    value: 'Ready',
    detail: '3 pending approvals',
    tone: 'text-warning'
  },
  {
    label: 'Issue Health',
    value: 'Clean',
    detail: 'No blockers reported',
    tone: 'text-success'
  },
  {
    label: 'Readiness',
    value: 'Healthy',
    detail: 'Release gate monitoring',
    tone: 'text-foreground'
  }
];

export default function LandingPage() {
  return (
    <section className="space-y-6">
      <div className="hero-shell relative overflow-hidden p-8 md:p-10">
        <div className="relative z-10 max-w-4xl">
          <p className="kpi-badge inline-flex">Pulltora Delivery Intelligence</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Visualize engineering risk before it hurts delivery</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Detect high-risk pull requests, stale reviews, and release blockers before they hurt velocity. Track
            workload imbalance and technical debt drift in one focused engineering cockpit.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn-primary hover:scale-[1.01]">
              Open Dashboard
            </Link>
            <Link to="/repositories/new" className="btn-soft">
              Add Repository
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickSignals.map((signal) => (
          <article key={signal.label} className="panel surface-float p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{signal.label}</p>
            <p className={`mt-2 text-2xl font-bold ${signal.tone}`}>{signal.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{signal.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="section-tile">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Current Focus</p>
          <ul className="mt-3 text-sm text-muted-foreground space-y-2">
            <li>Prioritize release confidence score for frontend services</li>
            <li>Rebalance code-review load across active reviewers</li>
            <li>Close stale critical issues within 48 hours</li>
          </ul>
        </article>
        <article className="section-tile">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Workflow Pulse</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Track velocity without noise. Pulltora keeps your team aligned on what matters and surfaces only
            engineering-relevant risks.
          </p>
        </article>
        <article className="section-tile">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Fastest Next Step</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Connect a repository and start getting automated PR risk scoring, stale-item alerts, and release
            blockers.
          </p>
          <Link to="/repositories" className="mt-4 inline-flex text-sm font-semibold text-brand hover:text-brand/90">
            Browse repositories →
          </Link>
        </article>
      </div>
    </section>
  );
}
