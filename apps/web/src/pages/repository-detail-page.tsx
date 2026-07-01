import { Link, useParams } from 'react-router-dom';

const sectionLinks = [
  { label: 'Overview', to: '' },
  { label: 'Pull Requests', to: 'pull-requests' },
  { label: 'Issues', to: 'issues' },
  { label: 'Reviews', to: 'reviews' },
  { label: 'Workload', to: 'workload' },
  { label: 'Hotspots', to: 'hotspots' },
  { label: 'Release Readiness', to: 'release-readiness' },
  { label: 'Technical Debt', to: 'technical-debt' },
  { label: 'Weekly Digest', to: 'weekly-digest' }
];

export default function RepositoryDetailPage() {
  const { id = 'unknown' } = useParams<{ id: string }>();

  return (
    <section className="space-y-5">
      <div className="page-title">
        <div>
          <p className="kpi-badge">Repository Workspace</p>
          <h1 className="mt-2 text-3xl font-bold">Repository {id}</h1>
          <p className="text-sm text-muted-foreground">Central intelligence hub for this repository.</p>
        </div>
        <span className="status-pill status-warn">Needs sync</span>
      </div>

      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {sectionLinks.map((section) => (
          <Link
            key={section.label}
            to={section.to ? `/repositories/${id}/${section.to}` : `/repositories/${id}`}
            className="section-tile text-sm text-center hover-lift"
          >
            {section.label}
          </Link>
        ))}
      </nav>

      <div className="panel p-4 text-sm text-muted-foreground">
        Select a domain above to inspect pull requests, workload, hotspots, and release-readiness in depth.
      </div>
    </section>
  );
}
