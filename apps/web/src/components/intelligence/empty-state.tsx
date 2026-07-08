type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <article className="subtle-card p-6 text-sm">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </article>
  );
}

