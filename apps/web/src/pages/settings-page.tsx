import { useQuery } from '@tanstack/react-query';
import { AiIntegrationCard } from '@/components/settings/ai-integration-card';
import { GithubIntegrationCard } from '@/components/settings/github-integration-card';
import { NotificationsCard } from '@/components/settings/notifications-card';
import { SettingsPageHeader } from '@/components/settings/settings-page-header';
import { SettingsErrorState, SettingsLoadingState, SettingsReadOnlyNote } from '@/components/settings/settings-state';
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
    return <SettingsLoadingState />;
  }

  if (isError) {
    return <SettingsErrorState error={error} onRetry={() => void refetch()} />;
  }

  if (!data) {
    return <SettingsErrorState error={new Error('Unable to load integration settings.')} onRetry={() => void refetch()} />;
  }

  return (
    <section className="space-y-6">
      <SettingsPageHeader />

      <div className="grid gap-4 lg:grid-cols-3">
        <GithubIntegrationCard github={data.github} />
        <AiIntegrationCard ai={data.ai} />
        <NotificationsCard />
      </div>

      <SettingsReadOnlyNote />
    </section>
  );
}
