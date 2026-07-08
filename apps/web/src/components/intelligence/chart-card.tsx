import { ReactNode } from 'react';

type ChartCardProps = {
  title: string;
  children: ReactNode;
};

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <article className="motion-rise panel p-5">
      <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">{title}</h2>
      <div className="mt-4 h-64">{children}</div>
    </article>
  );
}

