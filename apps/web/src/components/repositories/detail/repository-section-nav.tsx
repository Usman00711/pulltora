import { Link } from 'react-router-dom';
import { repositorySectionLinks } from './repository-detail.constants';

interface RepositorySectionNavProps {
  repositoryId: string;
}

export function RepositorySectionNav({ repositoryId }: RepositorySectionNavProps) {
  return (
    <>
      <nav className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {repositorySectionLinks.map((section) => (
          <Link
            key={section.label}
            to={section.to ? `/repositories/${repositoryId}/${section.to}` : `/repositories/${repositoryId}`}
            className="section-tile text-center text-sm font-semibold hover-lift"
          >
            {section.label}
          </Link>
        ))}
      </nav>

      <div className="panel p-4 text-sm text-muted-foreground">
        Select a domain above to inspect pull requests, workload, hotspots, and release-readiness in depth.
      </div>
    </>
  );
}
