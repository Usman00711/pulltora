import { Repository } from '@devpulse/shared';

interface RepositoryCommandHeaderProps {
  repository: Repository;
  isSyncing: boolean;
  isAnalyzing: boolean;
  isDeleting: boolean;
  onSync: () => void;
  onAnalyze: () => void;
  onDelete: () => void;
}

export function RepositoryCommandHeader({
  repository,
  isSyncing,
  isAnalyzing,
  isDeleting,
  onSync,
  onAnalyze,
  onDelete
}: RepositoryCommandHeaderProps) {
  return (
    <div className="page-title motion-rise">
      <div>
        <p className="kpi-badge">Repository Workspace</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{repository.fullName}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {repository.description || 'No description added yet.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="status-pill status-ok">{repository.language || 'Unknown stack'}</span>
          <span className="status-pill">Default: {repository.defaultBranch || 'main'}</span>
          <span className="status-pill">{repository.stars} stars</span>
          <span className="status-pill">{repository.forks} forks</span>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        <button type="button" className="btn-primary" onClick={onSync} disabled={isSyncing}>
          {isSyncing ? 'Syncing...' : 'Sync GitHub Data'}
        </button>
        <button
          type="button"
          className="btn-soft"
          onClick={onAnalyze}
          disabled={!repository.lastSyncedAt || isAnalyzing}
          title={!repository.lastSyncedAt ? 'Sync GitHub data before analysis' : undefined}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Repository'}
        </button>
        <a className="btn-soft" href={repository.url} target="_blank" rel="noreferrer">
          Open on GitHub
        </a>
        <button type="button" className="btn-danger" onClick={onDelete} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
