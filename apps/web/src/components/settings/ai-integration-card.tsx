import { IntegrationSettingsStatus } from '@devpulse/shared';
import { StatusBadge } from '@/components/intelligence/status-badge';

interface AiIntegrationCardProps {
  ai: IntegrationSettingsStatus['ai'];
}

function getAiLabel(ai: IntegrationSettingsStatus['ai']) {
  if (!ai.enabled) return 'Rules Only';
  if (ai.provider === 'gemini') return 'Gemini';
  return 'Ollama';
}

function getAiDescription(ai: IntegrationSettingsStatus['ai']) {
  if (!ai.enabled) {
    return 'Pulltora is using deterministic rule-based improvement ideas. This is free, private, and works without any AI server.';
  }

  if (ai.provider === 'gemini') {
    return 'Gemini enrichment is enabled through the backend. Pulltora still keeps rule-based insights as a fallback if Gemini is unavailable.';
  }

  return 'Local AI enrichment is enabled. Pulltora still keeps rule-based insights as a fallback if the local model is unavailable.';
}

export function AiIntegrationCard({ ai }: AiIntegrationCardProps) {
  return (
    <article className="panel glow-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kpi-badge">AI</p>
          <h2 className="mt-3 text-lg font-semibold">AI Insights</h2>
        </div>
        <StatusBadge label={getAiLabel(ai)} tone={ai.enabled ? 'cyan' : 'violet'} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{getAiDescription(ai)}</p>
      <div className="mt-5 grid gap-3 text-sm">
        <div className="rounded-2xl border border-border/70 bg-background/45 p-4">
          <p className="text-muted-foreground">Model</p>
          <p className="mt-1 font-semibold text-foreground">{ai.model || 'Not configured'}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/45 p-4">
          <p className="text-muted-foreground">
            {ai.provider === 'gemini' ? 'Gemini API key' : 'Local endpoint'}
          </p>
          <p className="mt-1 font-semibold text-foreground">
            {ai.provider === 'gemini'
              ? ai.apiKeyConfigured
                ? 'Configured'
                : 'Not configured'
              : ai.baseUrlConfigured
                ? 'Configured'
                : 'Not configured'}
          </p>
        </div>
      </div>
    </article>
  );
}
