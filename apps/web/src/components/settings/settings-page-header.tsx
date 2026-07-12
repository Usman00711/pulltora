interface SettingsPageHeaderProps {
  description?: string;
}

export function SettingsPageHeader({
  description = 'View safe integration status for GitHub, local AI insights, and future notifications.'
}: SettingsPageHeaderProps) {
  return (
    <div>
      <p className="kpi-badge">Platform Settings</p>
      <h1 className="mt-2 text-3xl font-bold">Settings</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
