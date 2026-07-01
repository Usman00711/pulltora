import { Link } from 'react-router-dom';

const sampleRepos = [
  {
    id: 'repo-1',
    name: 'acme/api-service',
    status: 'Healthy',
    latency: '12m ago',
    risk: 'Low'
  },
  {
    id: 'repo-2',
    name: 'acme/web-dashboard',
    status: 'Warning',
    latency: '3h ago',
    risk: 'Medium'
  }
];

export default function RepositoriesPage() {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kpi-badge">Repository Control</p>
          <h1 className="mt-2 text-3xl font-black">Repositories</h1>
          <p className="text-sm text-muted-foreground">Connect repos and monitor risk signals in one place.</p>
        </div>
        <Link to="/repositories/new" className="btn-primary">
          + Add Repository
        </Link>
      </div>

      <div className="panel p-4">
        <input className="glass-input" placeholder="Search repositories..." />
      </div>

      <div className="panel p-0 overflow-hidden">
        <div className="grid gap-px bg-border/70 sm:grid-cols-[1.7fr_0.9fr_0.8fr]">
          <div className="bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Repository</div>
          <div className="bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Risk</div>
          <div className="bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Last Sync</div>
        </div>
        <div className="divide-y divide-border">
          {sampleRepos.map((repo) => (
            <div
              key={repo.id}
              className="grid gap-3 p-4 transition-colors hover:bg-surface sm:grid-cols-[1.7fr_0.9fr_0.8fr]"
            >
              <div>
                <p className="font-semibold">{repo.name}</p>
                <p className="text-xs text-muted-foreground">Risk Score: {repo.risk}</p>
              </div>
              <Link
                to={`/repositories/${repo.id}`}
                className={`status-pill self-start ${repo.status === 'Warning' ? 'status-warn' : 'status-ok'}`}
              >
                {repo.status}
              </Link>
              <p className="self-center text-sm text-muted-foreground">{repo.latency}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
