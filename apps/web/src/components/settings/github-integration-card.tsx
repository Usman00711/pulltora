import { IntegrationSettingsStatus } from '@devpulse/shared';
import { StatusBadge } from '@/components/intelligence/status-badge';

interface GithubIntegrationCardProps {
  github: IntegrationSettingsStatus['github'];
}

export function GithubIntegrationCard({ github }: GithubIntegrationCardProps) {
  return (
    <article className="panel glow-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kpi-badge">GitHub</p>
          <h2 className="mt-3 text-lg font-semibold">GitHub Integration</h2>
        </div>
        <StatusBadge
          label={github.mode === 'token-authenticated' ? 'Token Auth' : 'Public API'}
          tone={github.tokenConfigured ? 'green' : 'amber'}
        />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {github.tokenConfigured
          ? 'A GitHub token is configured on the API. Pulltora can use higher rate limits and is ready for private repo support later.'
          : 'No GitHub token is configured. Public repositories still sync, but GitHub rate limits are stricter.'}
      </p>
      <div className="mt-5 rounded-2xl border border-border/70 bg-background/45 p-4 text-sm">
        <p className="text-muted-foreground">Secret exposure</p>
        <p className="mt-1 font-semibold text-foreground">Token value is never sent to the browser.</p>
      </div>
    </article>
  );
}
