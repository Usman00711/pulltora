import { StatusBadge } from '@/components/intelligence/status-badge';
import { SkeletonPanel } from '@/components/intelligence/skeleton-panel';
import { SettingsPageHeader } from './settings-page-header';

interface SettingsErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

export function SettingsLoadingState() {
  return (
    <section className="space-y-6">
      <SettingsPageHeader description="Checking integration status..." />
      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonPanel rows={4} />
        <SkeletonPanel rows={4} />
        <SkeletonPanel rows={4} />
      </div>
    </section>
  );
}

export function SettingsErrorState({ error, onRetry }: SettingsErrorStateProps) {
  return (
    <section className="space-y-6">
      <SettingsPageHeader description="Control workspace-level defaults and integrations." />
      <article className="panel p-5">
        <StatusBadge label="Error" tone="rose" />
        <p className="mt-4 text-sm text-red-300">
          {error instanceof Error ? error.message : 'Unable to load integration settings.'}
        </p>
        <button className="btn-soft mt-4" onClick={onRetry}>
          Retry
        </button>
      </article>
    </section>
  );
}

export function SettingsReadOnlyNote() {
  return (
    <article className="subtle-card p-6 text-sm text-muted-foreground">
      Settings are read-only in this phase. Update integration values in the API environment file, then restart the API for changes to take effect.
    </article>
  );
}
