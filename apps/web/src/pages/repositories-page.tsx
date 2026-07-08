import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { repositoryService } from '@/services/repository-service';

export default function RepositoriesPage() {
  const page = 1;
  const pageSize = 50;
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['repositories', { page, pageSize }],
    queryFn: () => repositoryService.list({ page, pageSize })
  });

  const deleteMutation = useMutation({
    mutationFn: repositoryService.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['repositories'] });
      setDeleteSuccess('Repository deleted successfully.');
    },
    onError: (err) => {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete repository.');
    }
  });

  const handleDelete = (id: string, name: string) => {
    const confirmDelete = window.confirm(`Delete repository ${name}?`);
    if (!confirmDelete) {
      return;
    }

    setDeleteError('');
    setDeleteSuccess('');
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <p className="mt-2 text-sm text-muted-foreground">Loading repositories...</p>;
  }

  if (isError) {
    return (
      <section className="space-y-3">
        <p className="text-sm text-red-300">{error instanceof Error ? error.message : 'Failed to load repositories.'}</p>
        <button className="btn-soft" onClick={() => void refetch()}>
          Retry
        </button>
      </section>
    );
  }

  const repositories = data?.items ?? [];

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

      {deleteError && <p className="text-sm text-red-300">{deleteError}</p>}
      {deleteSuccess && <p className="text-sm text-green-300">{deleteSuccess}</p>}

      {repositories.length === 0 ? (
        <div className="panel p-5">
          <p className="text-sm text-muted-foreground">No repositories yet. Add your first repository to start tracking pull-request and issue risks.</p>
        </div>
      ) : (
        <div className="panel p-0 overflow-hidden">
          <div className="grid gap-px bg-border/70 sm:grid-cols-[1.5fr_0.8fr_0.7fr_0.8fr_auto]">
            <div className="bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Repository</div>
            <div className="bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Language</div>
            <div className="bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Stars / Forks</div>
            <div className="bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Last Sync</div>
            <div className="bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground text-right">Actions</div>
          </div>
          <div className="divide-y divide-border">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="grid gap-3 p-4 text-sm transition-colors hover:bg-surface sm:grid-cols-[1.5fr_0.8fr_0.7fr_0.8fr_auto]"
              >
                <div>
                  <p className="font-semibold text-foreground">{repo.fullName}</p>
                  <p className="text-xs text-muted-foreground">{repo.url}</p>
                </div>
                <p className="text-muted-foreground">{repo.language || '—'}</p>
                <p className="text-muted-foreground">
                  {repo.stars} / {repo.forks}
                </p>
                <p className="text-muted-foreground">
                  {repo.lastSyncedAt ? new Date(repo.lastSyncedAt).toLocaleString() : 'Not synced yet'}
                </p>
                <div className="flex justify-end gap-2">
                  <Link to={`/repositories/${repo.id}`} className="btn-soft">
                    Open
                  </Link>
                  <button
                    type="button"
                    className="btn-soft"
                    onClick={() => {
                      handleDelete(repo.id, repo.fullName);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
