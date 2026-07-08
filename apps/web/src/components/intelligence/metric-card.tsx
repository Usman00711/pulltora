type MetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  tone?: 'cyan' | 'violet' | 'green' | 'amber' | 'rose';
};

export function MetricCard({ label, value, detail, tone = 'cyan' }: MetricCardProps) {
  const glow = {
    cyan: 'from-cyan-400/18',
    violet: 'from-violet-400/18',
    green: 'from-emerald-400/18',
    amber: 'from-amber-400/18',
    rose: 'from-rose-400/18'
  };

  return (
    <article className={`motion-rise panel glow-border relative overflow-hidden p-5`}>
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${glow[tone]} via-white/30 to-transparent`} />
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
      {detail ? <p className="mt-2 text-xs text-muted-foreground">{detail}</p> : null}
    </article>
  );
}

