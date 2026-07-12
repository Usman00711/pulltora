import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RepositoryCommandHeader } from '@/components/repositories/detail/repository-command-header';
import { RepositoryInsightsPanel } from '@/components/repositories/detail/repository-insights-panel';
import { RepositoryMetadataCard } from '@/components/repositories/detail/repository-metadata-card';
import { RepositoryPreviewColumns } from '@/components/repositories/detail/repository-preview-columns';
import { RepositoryRiskMetrics } from '@/components/repositories/detail/repository-risk-metrics';
import { RepositorySectionNav } from '@/components/repositories/detail/repository-section-nav';
import { RepositoryStatusGrid } from '@/components/repositories/detail/repository-status-grid';
import { RepositorySyncMetrics } from '@/components/repositories/detail/repository-sync-metrics';
import { SkeletonPanel } from '@/components/intelligence/skeleton-panel';
import { useToast } from '@/components/intelligence/toast';
import { repositoryService } from '@/services/repository-service';

export default function RepositoryDetailPage() {
  const { id = 'unknown' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['repository', id],
    queryFn: () => repositoryService.getById(id),
    enabled: Boolean(id)
  });

  const pullRequestQuery = useQuery({
    queryKey: ['repositoryPullRequests', id],
    queryFn: () => repositoryService.listPullRequests(id),
    enabled: Boolean(id)
  });

  const issueQuery = useQuery({
    queryKey: ['repositoryIssues', id],
    queryFn: () => repositoryService.listIssues(id),
    enabled: Boolean(id)
  });

  const contributorQuery = useQuery({
    queryKey: ['repositoryContributors', id],
    queryFn: () => repositoryService.listContributors(id),
    enabled: Boolean(id)
  });

  const riskQuery = useQuery({
    queryKey: ['repositoryRisks', id],
    queryFn: () => repositoryService.getRisks(id),
    enabled: Boolean(id)
  });

  const insightQuery = useQuery({
    queryKey: ['repositoryInsights', id],
    queryFn: () => repositoryService.listRepositoryInsights(id),
    enabled: Boolean(id)
  });

  const healthQuery = useQuery({
    queryKey: ['repositoryHealth', id],
    queryFn: () => repositoryService.getRepositoryHealth(id),
    enabled: Boolean(id)
  });

  const syncedCounts = useMemo(() => {
    return {
      pullRequests: pullRequestQuery.data?.total ?? 0,
      issues: issueQuery.data?.total ?? 0,
      contributors: contributorQuery.data?.total ?? 0
    };
  }, [pullRequestQuery.data?.total, issueQuery.data?.total, contributorQuery.data?.total]);

  const deleteMutation = useMutation({
    mutationFn: () => repositoryService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['repositories'] });
      navigate('/repositories');
    }
  });

  const syncMutation = useMutation({
    mutationFn: () => repositoryService.syncRepository(id),
    onSuccess: async () => {
      showToast('GitHub sync complete', 'success');

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['repository', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryHealth', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryPullRequests', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryIssues', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryContributors', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryRisks', id] })
      ]);
    },
    onError: (syncErr) => {
      const message = syncErr instanceof Error ? syncErr.message : 'Failed to sync repository with GitHub';

      if (/rate.?limit|rate limit/i.test(message)) {
        showToast('GitHub rate limit reached. Add a GITHUB_TOKEN or try again later.', 'error');
        return;
      }

      if (/not found/i.test(message)) {
        showToast('GitHub repository not found', 'error');
        return;
      }

      showToast('Unable to sync repository', 'error');
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: () => repositoryService.analyzeRepository(id),
    onSuccess: async () => {
      showToast('Repository analysis complete', 'success');

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['repositoryHealth', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryPullRequests', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryIssues', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryContributors', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryHotspots', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryReviewBottlenecks', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryRisks', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryWorkloadSummary', id] }),
        queryClient.invalidateQueries({ queryKey: ['repositoryInsights', id] })
      ]);
    },
    onError: (analysisErr) => {
      const message = analysisErr instanceof Error ? analysisErr.message : 'Failed to analyze repository';
      showToast(message, 'error');
    }
  });

  const insightMutation = useMutation({
    mutationFn: () => repositoryService.generateRepositoryInsights(id),
    onSuccess: async () => {
      showToast('Improvement ideas refreshed', 'success');
      await queryClient.invalidateQueries({ queryKey: ['repositoryInsights', id] });
    },
    onError: (insightErr) => {
      const message = insightErr instanceof Error ? insightErr.message : 'Failed to refresh improvement ideas';
      showToast(message, 'error');
    }
  });

  const handleDelete = () => {
    const confirmDelete = window.confirm('Delete this repository? This action cannot be undone.');
    if (!confirmDelete) {
      return;
    }

    deleteMutation.mutate();
  };

  if (isLoading) {
    return <SkeletonPanel rows={6} />;
  }

  if (isError) {
    return (
      <section className="space-y-3">
        <p className="text-sm text-red-300">{error instanceof Error ? error.message : 'Failed to load repository.'}</p>
        <button className="btn-soft" onClick={() => void refetch()}>
          Retry
        </button>
      </section>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Repository not found.</p>;
  }

  return (
    <section className="space-y-5">
      <RepositoryCommandHeader
        repository={data}
        isSyncing={syncMutation.isPending}
        isAnalyzing={analyzeMutation.isPending}
        isDeleting={deleteMutation.isPending}
        onSync={() => syncMutation.mutate()}
        onAnalyze={() => analyzeMutation.mutate()}
        onDelete={handleDelete}
      />

      <RepositoryStatusGrid repository={data} health={healthQuery.data} />
      <RepositorySyncMetrics repository={data} counts={syncedCounts} />
      <RepositoryRiskMetrics risk={riskQuery.data} />

      <RepositoryInsightsPanel
        insights={insightQuery.data}
        isLoading={insightQuery.isLoading}
        isError={insightQuery.isError}
        error={insightQuery.error}
        isRefreshing={insightMutation.isPending}
        canRefresh={Boolean(data.lastSyncedAt)}
        onRefresh={() => insightMutation.mutate()}
      />

      <RepositoryPreviewColumns
        repositoryId={id}
        pullRequests={pullRequestQuery.data?.items.slice(0, 3) ?? []}
        issues={issueQuery.data?.items.slice(0, 3) ?? []}
        contributors={contributorQuery.data?.items.slice(0, 4) ?? []}
        isPullRequestsLoading={pullRequestQuery.isLoading}
        isIssuesLoading={issueQuery.isLoading}
        isContributorsLoading={contributorQuery.isLoading}
      />

      <RepositoryMetadataCard repository={data} />
      <RepositorySectionNav repositoryId={id} />
    </section>
  );
}
