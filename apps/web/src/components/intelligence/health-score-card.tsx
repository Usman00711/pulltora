import { HealthLevel } from '@devpulse/shared';
import { getHealthTone, StatusBadge } from './status-badge';

type HealthScoreCardProps = {
  score: number;
  level: HealthLevel;
  reasons?: string[];
};

export function HealthScoreCard({ score, level, reasons = [] }: HealthScoreCardProps) {
  return (
    <article className="motion-rise panel glow-border relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Health Score</p>
          <p className="mt-3 text-5xl font-black">{score}</p>
        </div>
        <StatusBadge label={level.replace('_', ' ')} tone={getHealthTone(level)} />
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-900">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-emerald-300"
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{reasons.slice(0, 2).join(' · ') || 'No major delivery risks detected'}</p>
    </article>
  );
}

