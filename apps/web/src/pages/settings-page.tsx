import { useQuery } from '@tanstack/react-query';
import { StatusBadge } from '@/components/intelligence/status-badge';
import { SkeletonPanel } from '@/components/intelligence/skeleton-panel';
import { settingsService } from '@/services/settings-service';

export default function SettingsPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['integrationSettings'],
    queryFn: () => settingsService.getIntegrationStatus()
  });

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div>
          <p className="kpi-badge">Platform Settings</p>
          <h1 className="mt-2 text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Checking integration status...</p>
        </div>
        <SkeletonPanel rows={5} />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="space-y-6">
        <div>
          <p className="kpi-badge">Platform Settings</p>
          <h1 className="mt-2 text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Control workspace-level defaults and integrations.</p>
        </div>
        <article className="panel p-5">
          <StatusBadge label="Error" tone="rose" />
          <p className="mt-4 text-sm text-red-300">
            {error instanceof Error ? error.message : 'Unable to load integration settings.'}
          </p>
          <button className="btn-soft mt-4" onClick={() => void refetch()}>
            Retry
          </button>
        </article>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="kpi-badge">Platform Settings</p>
        <h1 className="mt-2 text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          View safe integration status for GitHub, local AI insights, and future notifications.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="panel p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="kpi-badge">GitHub</p>
              <h2 className="mt-3 text-lg font-semibold">GitHub Integration</h2>
            </div>
            <StatusBadge
              label={data?.github.mode === 'token-authenticated' ? 'Token Auth' : 'Public API'}
              tone={data?.github.tokenConfigured ? 'green' : 'amber'}
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {data?.github.tokenConfigured
              ? 'A GitHub token is configured on the API. Pulltora can use higher rate limits and is ready for private repo support later.'
              : 'No GitHub token is configured. Public repositories still sync, but GitHub rate limits are stricter.'}
          </p>
          <div className="mt-5 rounded-2xl border border-border/70 bg-background/45 p-4 text-sm">
            <p className="text-muted-foreground">Secret exposure</p>
            <p className="mt-1 font-semibold text-foreground">Token value is never sent to the browser.</p>
          </div>
        </article>

        <article className="panel p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="kpi-badge">AI</p>
              <h2 className="mt-3 text-lg font-semibold">AI Insights</h2>
            </div>
            <StatusBadge
              label={
                data?.ai.enabled
                  ? data.ai.provider === 'gemini'
                    ? 'Gemini'
                    : 'Ollama'
                  : 'Rules Only'
              }
              tone={data?.ai.enabled ? 'cyan' : 'violet'}
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {data?.ai.enabled
              ? data.ai.provider === 'gemini'
                ? 'Gemini enrichment is enabled through the backend. Pulltora still keeps rule-based insights as a fallback if Gemini is unavailable.'
                : 'Local AI enrichment is enabled. Pulltora still keeps rule-based insights as a fallback if the local model is unavailable.'
              : 'Pulltora is using deterministic rule-based improvement ideas. This is free, private, and works without any AI server.'}
          </p>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="rounded-2xl border border-border/70 bg-background/45 p-4">
              <p className="text-muted-foreground">Model</p>
              <p className="mt-1 font-semibold text-foreground">{data?.ai.model || 'Not configured'}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/45 p-4">
              <p className="text-muted-foreground">
                {data?.ai.provider === 'gemini' ? 'Gemini API key' : 'Local endpoint'}
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {data?.ai.provider === 'gemini'
                  ? data.ai.apiKeyConfigured
                    ? 'Configured'
                    : 'Not configured'
                  : data?.ai.baseUrlConfigured
                    ? 'Configured'
                    : 'Not configured'}
              </p>
            </div>
          </div>
        </article>

        <article className="panel p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="kpi-badge">Alerts</p>
              <h2 className="mt-3 text-lg font-semibold">Notifications</h2>
            </div>
            <StatusBadge label="Coming Soon" tone="slate" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Alerts for critical PRs, stale reviews, issue risk, and weekly engineering digests will live here later.
          </p>
          <div className="mt-5 rounded-2xl border border-border/70 bg-background/45 p-4 text-sm">
            <p className="text-muted-foreground">Planned channels</p>
            <p className="mt-1 font-semibold text-foreground">Email, Slack, Discord, and webhooks.</p>
          </div>
        </article>
      </div>

      <article className="subtle-card p-6 text-sm text-muted-foreground">
        Settings are read-only in this phase. Update integration values in the API environment file, then restart the API for changes to take effect.
      </article>
    </section>
  );
}
