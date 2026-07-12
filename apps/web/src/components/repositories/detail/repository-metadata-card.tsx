import { Repository } from '@devpulse/shared';

interface RepositoryMetadataCardProps {
  repository: Repository;
}

export function RepositoryMetadataCard({ repository }: RepositoryMetadataCardProps) {
  return (
    <article className="panel p-5">
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <p className="text-muted-foreground">
          Owner: <span className="text-foreground font-semibold">{repository.owner}</span>
        </p>
        <p className="text-muted-foreground">
          Name: <span className="text-foreground font-semibold">{repository.name}</span>
        </p>
        <p className="text-muted-foreground">
          Full name: <span className="text-foreground font-semibold">{repository.fullName}</span>
        </p>
      </div>
    </article>
  );
}
